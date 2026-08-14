<?php

namespace App\Actions\Prescriptions;

use App\Events\StockDispensed;
use App\Exceptions\InvalidDispenseQuantityException;
use App\Exceptions\InvalidPrescriptionStatusException;
use App\Exceptions\PatientAllergyException;
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

            $prescription->load(['visit.patient.allergies', 'items.medicine']);
            $patient = $prescription->visit?->patient;

            $items = $prescription->items;
            $toDeduct = [];
            foreach ($items as $item) {
                // Check patient allergies if patient exists
                if ($patient && $item->medicine) {
                    $medName = strtolower($item->medicine->name);
                    $genericName = strtolower($item->medicine->generic_name ?? '');

                    foreach ($patient->allergies as $allergy) {
                        if (! $allergy->is_active) {
                            continue;
                        }
                        $allergen = strtolower($allergy->allergen);
                        if (($medName && str_contains($medName, $allergen)) || ($genericName && str_contains($genericName, $allergen)) || ($allergen && (str_contains($medName, $allergen) || str_contains($allergen, $medName)))) {
                            $severity = strtolower($allergy->severity ?? 'severe');
                            if (in_array($severity, ['severe', 'critical', 'high', 'major'])) {
                                throw PatientAllergyException::severeAllergy($allergy->allergen, $allergy->severity ?? 'severe');
                            }
                        }
                    }
                }

                // Validate prescribed quantity
                if ($item->quantity <= 0) {
                    throw InvalidDispenseQuantityException::zeroQuantity();
                }

                // Validate that dispensed quantity doesn't exceed prescribed quantity
                if (($item->dispensed_quantity ?? 0) > $item->quantity) {
                    throw InvalidDispenseQuantityException::exceedsPrescribedQuantity($item->id);
                }

                $remaining = max(0, $item->quantity - ($item->dispensed_quantity ?? 0));
                if ($remaining <= 0) {
                    continue;
                }

                $toDeduct[] = ['medicine_id' => $item->medicine_id, 'quantity' => $remaining, 'prescription_item_id' => $item->id, 'prescription_id' => $prescription->id, 'patient_id' => $patient?->id];
            }

            // Call inventory service without its own transaction (we're already in one)
            $results = $this->inventory->deductMultipleWithoutTransaction($toDeduct);

            // update dispensed quantities and set stock movement references
            foreach ($results as $r) {
                if (! empty($r['prescription_item_id'])) {
                    $pi = $prescription->items()->find($r['prescription_item_id']);
                    if ($pi) {
                        $pi->setAttribute('dispensed_quantity', ($pi->dispensed_quantity ?? 0) + array_sum(array_map(fn ($m) => $m->quantity, $r['movements'])));
                        $pi->setAttribute('dispensed_at', now());
                        $pi->save();

                        // Update stock movements to reference the prescription item
                        foreach ($r['movements'] as $movement) {
                            $movement->update([
                                'reference_type' => 'prescription_item',
                                'reference_id' => $pi->id,
                            ]);
                        }
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
