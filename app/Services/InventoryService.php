<?php

namespace App\Services;

use App\Actions\Inventory\ReceiveStockAction;
use App\Actions\Inventory\RecordStockMovementAction;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\MedicineExpiredException;
use App\Models\InventoryBatch;
use App\Models\Medicine;
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
