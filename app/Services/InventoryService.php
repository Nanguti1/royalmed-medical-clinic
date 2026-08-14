<?php

namespace App\Services;

use App\Actions\Inventory\ReceiveStockAction;
use App\Actions\Inventory\RecordStockMovementAction;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\MedicineExpiredException;
use App\Models\ControlledDrugRegister;
use App\Models\GoodsReceivedNote;
use App\Models\InventoryBatch;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    protected ReceiveStockAction $receiveAction;

    protected RecordStockMovementAction $movementAction;

    public function __construct(ReceiveStockAction $receiveAction, RecordStockMovementAction $movementAction)
    {
        $this->receiveAction = $receiveAction;
        $this->movementAction = $movementAction;
    }

    public function receive(array $data): InventoryBatch
    {
        return DB::transaction(function () use ($data) {
            $batch = $this->receiveAction->execute($data);
            $this->movementAction->execute([
                'medicine_id' => $batch->medicine_id,
                'inventory_batch_id' => $batch->id,
                'quantity' => $batch->quantity,
                'movement_type' => 'in',
                'reference_type' => 'purchase',
                'reference_id' => $batch->id,
                'user_id' => Auth::id(),
            ]);
            Log::info('Stock received', ['batch_id' => $batch->id]);

            return $batch;
        });
    }

    public function deduct(Medicine $medicine, float $quantity, bool $useTransaction = true)
    {
        $executeDeduction = function () use ($medicine, $quantity) {
            // Pre-check: ensure sufficient non-expired stock exists
            $availableStock = InventoryBatch::where('medicine_id', $medicine->id)
                ->where('quantity', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>', now());
                })
                ->sum('quantity');

            if ($availableStock < $quantity) {
                // Check if we have any stock at all (expired or not)
                $totalStock = InventoryBatch::where('medicine_id', $medicine->id)
                    ->where('quantity', '>', 0)
                    ->sum('quantity');

                if ($totalStock >= $quantity) {
                    // We have stock but it's all expired
                    throw new MedicineExpiredException("Cannot dispense {$medicine->name}: no non-expired stock available");
                }

                // We genuinely don't have enough stock
                throw new InsufficientStockException("Insufficient stock: {$availableStock} available, {$quantity} requested");
            }

            // FEFO: First Expiry, First Out allocation
            $remaining = $quantity;
            $movements = [];

            // Lock batches for concurrent deduction safety
            // Use COALESCE to treat NULL expiry dates as far future (so they're used last)
            $batches = InventoryBatch::where('medicine_id', $medicine->id)
                ->where('quantity', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>', now());
                })
                ->orderByRaw('COALESCE(expiry_date, "9999-12-31") ASC')
                ->lockForUpdate()
                ->get();

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                // Double-check batch is still valid after lock
                if ($batch->isExpired()) {
                    continue;
                }

                if ($batch->isDepleted()) {
                    continue;
                }

                $take = min($batch->quantity, $remaining);
                if ($take <= 0) {
                    continue;
                }

                // Use decrement with atomic operation
                $batch->decrement('quantity', $take);

                $movement = $this->movementAction->execute([
                    'medicine_id' => $medicine->id,
                    'inventory_batch_id' => $batch->id,
                    'quantity' => $take,
                    'movement_type' => 'out',
                    'reference_type' => 'dispense',
                    'reference_id' => null,
                    'user_id' => Auth::id(),
                ]);

                if ($medicine->is_controlled) {
                    $balanceAfter = InventoryBatch::where('medicine_id', $medicine->id)->sum('quantity');
                    ControlledDrugRegister::create([
                        'medicine_id' => $medicine->id,
                        'inventory_batch_id' => $batch->id,
                        'quantity' => $take,
                        'transaction_type' => 'dispense',
                        'balance_after' => $balanceAfter,
                        'dispensed_by' => Auth::id(),
                        'notes' => 'Controlled drug dispensed',
                    ]);

                    app(AuditService::class)->log(
                        Auth::id(),
                        'controlled_drug_dispense',
                        $medicine,
                        [],
                        ['quantity' => $take, 'balance_after' => $balanceAfter, 'batch_id' => $batch->id]
                    );
                }

                $movements[] = $movement;
                $remaining -= $take;
            }

            if ($remaining > 0) {
                throw new InsufficientStockException('Insufficient stock to fulfill quantity');
            }

            Log::info('Stock deducted', ['medicine_id' => $medicine->id, 'quantity' => $quantity]);

            return $movements;
        };

        if ($useTransaction) {
            return DB::transaction($executeDeduction);
        }

        return $executeDeduction();
    }

    public function adjustStock(array $data): StockAdjustment
    {
        return DB::transaction(function () use ($data) {
            $adjustment = StockAdjustment::create([
                'medicine_id' => $data['medicine_id'],
                'inventory_batch_id' => $data['inventory_batch_id'] ?? null,
                'adjustment_type' => $data['adjustment_type'],
                'quantity' => $data['quantity'],
                'reason' => $data['reason'] ?? 'Manual Adjustment',
                'status' => $data['status'] ?? 'approved',
                'requested_by' => Auth::id(),
                'approved_by' => isset($data['status']) && $data['status'] === 'approved' ? Auth::id() : null,
                'approved_at' => isset($data['status']) && $data['status'] === 'approved' ? now() : null,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($adjustment->status === 'approved') {
                $batch = $adjustment->inventory_batch_id
                    ? InventoryBatch::find($adjustment->inventory_batch_id)
                    : InventoryBatch::where('medicine_id', $adjustment->medicine_id)->orderBy('created_at', 'desc')->first();

                if ($batch) {
                    if (in_array($adjustment->adjustment_type, ['addition', 'return'])) {
                        $batch->increment('quantity', $adjustment->quantity);
                        $movementType = 'in';
                    } else {
                        $batch->decrement('quantity', min($batch->quantity, $adjustment->quantity));
                        $movementType = 'out';
                    }

                    $this->movementAction->execute([
                        'medicine_id' => $adjustment->medicine_id,
                        'inventory_batch_id' => $batch->id,
                        'quantity' => $adjustment->quantity,
                        'movement_type' => $movementType,
                        'reference_type' => 'stock_adjustment',
                        'reference_id' => $adjustment->id,
                        'user_id' => Auth::id(),
                    ]);
                }

                app(AuditService::class)->log(
                    Auth::id(),
                    'stock_adjustment',
                    $adjustment,
                    [],
                    ['type' => $adjustment->adjustment_type, 'quantity' => $adjustment->quantity, 'reason' => $adjustment->reason]
                );
            }

            return $adjustment;
        });
    }

    public function returnStock(array $data): StockMovement
    {
        return DB::transaction(function () use ($data) {
            $medicine = Medicine::findOrFail($data['medicine_id']);
            $batch = isset($data['inventory_batch_id'])
                ? InventoryBatch::find($data['inventory_batch_id'])
                : InventoryBatch::where('medicine_id', $medicine->id)->first();

            if (! $batch) {
                $batch = InventoryBatch::create([
                    'medicine_id' => $medicine->id,
                    'batch_number' => 'RET-'.now()->format('YmdHis'),
                    'quantity' => 0,
                    'received_at' => now(),
                ]);
            }

            $batch->increment('quantity', $data['quantity']);

            $movement = $this->movementAction->execute([
                'medicine_id' => $medicine->id,
                'inventory_batch_id' => $batch->id,
                'quantity' => $data['quantity'],
                'movement_type' => 'in',
                'reference_type' => 'return',
                'reference_id' => $data['reference_id'] ?? null,
                'user_id' => Auth::id(),
            ]);

            if ($medicine->is_controlled) {
                ControlledDrugRegister::create([
                    'medicine_id' => $medicine->id,
                    'inventory_batch_id' => $batch->id,
                    'quantity' => $data['quantity'],
                    'transaction_type' => 'return',
                    'balance_after' => InventoryBatch::where('medicine_id', $medicine->id)->sum('quantity'),
                    'dispensed_by' => Auth::id(),
                    'notes' => $data['reason'] ?? 'Customer/Dispensing return',
                ]);
            }

            app(AuditService::class)->log(
                Auth::id(),
                'stock_return',
                $medicine,
                [],
                ['quantity' => $data['quantity'], 'batch_id' => $batch->id]
            );

            return $movement;
        });
    }

    public function transferStock(array $data): StockTransfer
    {
        return DB::transaction(function () use ($data) {
            $transfer = StockTransfer::create([
                'medicine_id' => $data['medicine_id'],
                'inventory_batch_id' => $data['inventory_batch_id'] ?? null,
                'from_location' => $data['from_location'] ?? 'Main Store',
                'to_location' => $data['to_location'] ?? 'OPD Pharmacy',
                'quantity' => $data['quantity'],
                'status' => 'completed',
                'transferred_by' => Auth::id(),
                'notes' => $data['notes'] ?? null,
            ]);

            $this->movementAction->execute([
                'medicine_id' => $data['medicine_id'],
                'inventory_batch_id' => $data['inventory_batch_id'] ?? null,
                'quantity' => $data['quantity'],
                'movement_type' => 'transfer',
                'reference_type' => 'stock_transfer',
                'reference_id' => $transfer->id,
                'user_id' => Auth::id(),
            ]);

            app(AuditService::class)->log(
                Auth::id(),
                'stock_transfer',
                $transfer,
                [],
                ['from' => $transfer->from_location, 'to' => $transfer->to_location, 'quantity' => $transfer->quantity]
            );

            return $transfer;
        });
    }

    public function createPurchaseOrder(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            $poNumber = NumberGenerator::generatePurchaseOrderNumber();
            $po = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'order_date' => $data['order_date'] ?? now()->toDateString(),
                'status' => $data['status'] ?? 'submitted',
                'total_amount' => 0,
                'created_by' => Auth::id(),
                'notes' => $data['notes'] ?? null,
            ]);

            $total = 0;
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $it) {
                    $itemTotal = ($it['quantity_ordered'] ?? 0) * ($it['unit_price'] ?? 0);
                    $po->items()->create([
                        'medicine_id' => $it['medicine_id'],
                        'quantity_ordered' => $it['quantity_ordered'],
                        'unit_price' => $it['unit_price'] ?? 0,
                        'total_price' => $itemTotal,
                    ]);
                    $total += $itemTotal;
                }
            }

            $po->update(['total_amount' => $total]);

            return $po->load('items');
        });
    }

    public function receiveGoodsReceivedNote(array $data): GoodsReceivedNote
    {
        return DB::transaction(function () use ($data) {
            $grnNumber = NumberGenerator::generateGoodsReceivedNoteNumber();
            $grn = GoodsReceivedNote::create([
                'grn_number' => $grnNumber,
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'supplier_id' => $data['supplier_id'],
                'received_date' => $data['received_date'] ?? now()->toDateString(),
                'received_by' => Auth::id(),
                'delivery_note_number' => $data['delivery_note_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $it) {
                    $batch = $this->receive([
                        'medicine_id' => $it['medicine_id'],
                        'batch_number' => $it['batch_number'] ?? 'GRN-'.$grn->id,
                        'expiry_date' => $it['expiry_date'] ?? now()->addYear(),
                        'quantity' => $it['quantity'],
                        'purchase_price' => $it['unit_price'] ?? 0,
                        'supplier_id' => $data['supplier_id'],
                        'received_at' => now(),
                    ]);
                }
            }

            return $grn;
        });
    }

    public function generateInventoryAlerts(): array
    {
        $alerts = [];

        // Low stock alerts
        $medicines = Medicine::whereNotNull('reorder_level')->get();
        foreach ($medicines as $med) {
            $totalStock = InventoryBatch::where('medicine_id', $med->id)->sum('quantity');
            if ($totalStock <= $med->reorder_level) {
                $alerts[] = [
                    'type' => 'low_stock',
                    'medicine_id' => $med->id,
                    'medicine_name' => $med->name,
                    'current_stock' => $totalStock,
                    'reorder_level' => $med->reorder_level,
                    'message' => "Low stock alert: {$med->name} is at {$totalStock} (Reorder level: {$med->reorder_level})",
                ];
            }
        }

        // Expired batch alerts
        $expiredBatches = InventoryBatch::with('medicine')
            ->where('quantity', '>', 0)
            ->where('expiry_date', '<=', now())
            ->get();

        foreach ($expiredBatches as $b) {
            $alerts[] = [
                'type' => 'expired_stock',
                'medicine_id' => $b->medicine_id,
                'medicine_name' => $b->medicine?->name,
                'batch_number' => $b->batch_number,
                'expiry_date' => $b->expiry_date?->toDateString(),
                'message' => "Expired stock alert: Batch {$b->batch_number} of {$b->medicine?->name} expired on {$b->expiry_date?->toDateString()}",
            ];
        }

        // Expiring soon alerts (within 30 days)
        $expiringBatches = InventoryBatch::with('medicine')
            ->where('quantity', '>', 0)
            ->where('expiry_date', '>', now())
            ->where('expiry_date', '<=', now()->addDays(30))
            ->get();

        foreach ($expiringBatches as $b) {
            $alerts[] = [
                'type' => 'expiring_soon',
                'medicine_id' => $b->medicine_id,
                'medicine_name' => $b->medicine?->name,
                'batch_number' => $b->batch_number,
                'expiry_date' => $b->expiry_date?->toDateString(),
                'message' => "Expiring soon alert: Batch {$b->batch_number} of {$b->medicine?->name} expires on {$b->expiry_date?->toDateString()}",
            ];
        }

        return $alerts;
    }

    /**
     * Deduct multiple items for a prescription in one transaction.
     * Accepts array of ['medicine_id' => id, 'quantity' => qty, 'prescription_item_id' => id]
     */
    public function deductMultiple(array $items)
    {
        return DB::transaction(function () use ($items) {
            $results = [];
            foreach ($items as $it) {
                $medicine = Medicine::findOrFail($it['medicine_id']);
                $qty = (float) $it['quantity'];
                $movements = $this->deduct($medicine, $qty);
                $results[] = ['medicine_id' => $medicine->id, 'movements' => $movements, 'prescription_item_id' => $it['prescription_item_id'] ?? null];
            }

            return $results;
        });
    }

    /**
     * Deduct multiple items without wrapping in a transaction.
     * Use this when called from within an existing transaction.
     * Accepts array of ['medicine_id' => id, 'quantity' => qty, 'prescription_item_id' => id]
     */
    public function deductMultipleWithoutTransaction(array $items)
    {
        $results = [];
        foreach ($items as $it) {
            $medicine = Medicine::findOrFail($it['medicine_id']);
            $qty = (float) $it['quantity'];
            $movements = $this->deduct($medicine, $qty, false);
            $results[] = ['medicine_id' => $medicine->id, 'movements' => $movements, 'prescription_item_id' => $it['prescription_item_id'] ?? null];
        }

        return $results;
    }
}
