<?php

namespace App\Actions\Prescriptions;

use App\Events\StockDispensed;
use App\Exceptions\InvalidPrescriptionStatusException;
use App\Models\Prescription;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DispensePrescriptionAction
{
    protected InventoryService $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    /**
     * Dispense all items in a prescription. Returns array of movements.
     */
    public function execute(Prescription $prescription): array
    {
        return DB::transaction(function () use ($prescription) {
            if (! $prescription->canDispense()) {
                if (! $prescription->isFinalized()) {
                    throw InvalidPrescriptionStatusException::cannotDispenseUnfinalized();
                }

                if ($prescription->isDispensed()) {
                    throw InvalidPrescriptionStatusException::cannotDispenseAlreadyDispensed();
                }

                throw InvalidPrescriptionStatusException::invalidStatus($prescription->finalized_at ? 'finalized' : 'draft', 'dispensed');
            }

            $items = $prescription->items;
            $toDeduct = [];
            foreach ($items as $item) {
                $remaining = max(0, $item->quantity - ($item->dispensed_quantity ?? 0));
                if ($remaining <= 0) {
                    continue;
                }
                $toDeduct[] = ['medicine_id' => $item->medicine_id, 'quantity' => $remaining, 'prescription_item_id' => $item->id];
            }

            // Call inventory service without its own transaction (we're already in one)
            $results = $this->inventory->deductMultipleWithoutTransaction($toDeduct);

            // update dispensed quantities
            foreach ($results as $r) {
                if (! empty($r['prescription_item_id'])) {
                    $pi = $prescription->items()->find($r['prescription_item_id']);
                    if ($pi) {
                        $pi->dispensed_quantity = ($pi->dispensed_quantity ?? 0) + array_sum(array_map(fn ($m) => $m->quantity, $r['movements']));
                        $pi->dispensed_at = now();
                        $pi->save();
                    }
                }
            }

            // mark prescription as dispensed if all items are dispensed
            $prescription->refresh();
            if ($prescription->isFullyDispensed()) {
                $prescription->dispensed_at = now();
                $prescription->save();
            }

            $prescription->load('items');
            Log::info('Prescription dispensed', ['prescription_id' => $prescription->id]);

            event(new StockDispensed($prescription));

            return $results;
        });
    }
}
