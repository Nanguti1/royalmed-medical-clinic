<?php

namespace App\Services;

use App\Actions\Prescriptions\AddPrescriptionItemAction;
use App\Actions\Prescriptions\CreatePrescriptionAction;
use App\Actions\Prescriptions\CreatePrescriptionWithItemsAction;
use App\Actions\Prescriptions\DispensePrescriptionAction;
use App\Actions\Prescriptions\FinalizePrescriptionAction;
use App\Models\DrugInteraction;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\PatientAllergy;
use App\Models\Prescription;
use Illuminate\Support\Facades\DB;

class PrescriptionService
{
    protected CreatePrescriptionAction $createAction;

    protected CreatePrescriptionWithItemsAction $createWithItemsAction;

    protected AddPrescriptionItemAction $addItemAction;

    protected FinalizePrescriptionAction $finalizeAction;

    protected DispensePrescriptionAction $dispenseAction;

    public function __construct(
        CreatePrescriptionAction $createAction,
        CreatePrescriptionWithItemsAction $createWithItemsAction,
        AddPrescriptionItemAction $addItemAction,
        FinalizePrescriptionAction $finalizeAction,
        DispensePrescriptionAction $dispenseAction
    ) {
        $this->createAction = $createAction;
        $this->createWithItemsAction = $createWithItemsAction;
        $this->addItemAction = $addItemAction;
        $this->finalizeAction = $finalizeAction;
        $this->dispenseAction = $dispenseAction;
    }

    public function create(array $data): Prescription
    {
        return DB::transaction(function () use ($data) {
            return $this->createAction->execute($data);
        });
    }

    public function createWithItems(array $data): Prescription
    {
        return DB::transaction(function () use ($data) {
            // Validate medicine availability before creating prescription
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    if (isset($item['medicine_id'])) {
                        $medicine = Medicine::with('batches')->find($item['medicine_id']);
                        if ($medicine) {
                            $totalStock = $medicine->batches->sum('quantity');
                            $hasExpired = $medicine->batches->contains(fn ($batch) => $batch->isExpired());
                            $availableStock = $totalStock - ($hasExpired ? $medicine->batches->where(fn ($batch) => $batch->isExpired())->sum('quantity') : 0);

                            if ($availableStock < ($item['quantity'] ?? 0)) {
                                throw new \Exception("Insufficient stock for {$medicine->name}. Available: {$availableStock}, Required: {$item['quantity']}");
                            }

                            if ($hasExpired && $availableStock <= 0) {
                                throw new \Exception("Only expired stock available for {$medicine->name}");
                            }
                        }
                    }
                }
            }

            return $this->createWithItemsAction->execute($data);
        });
    }

    public function addItem(array $data)
    {
        return DB::transaction(function () use ($data) {
            return $this->addItemAction->execute($data);
        });
    }

    public function finalize(Prescription $prescription): Prescription
    {
        return DB::transaction(function () use ($prescription) {
            return $this->finalizeAction->execute($prescription);
        });
    }

    public function dispense(Prescription $prescription): array
    {
        // Note: Transaction is handled in DispensePrescriptionAction
        // to ensure atomicity across prescription state and inventory changes
        return $this->dispenseAction->execute($prescription);
    }

    public function checkPatientAllergies($patient, array $medicineIds): array
    {
        $patientModel = is_numeric($patient) ? Patient::find($patient) : $patient;
        if (! $patientModel) {
            return [];
        }

        $allergies = PatientAllergy::where('patient_id', $patientModel->id)
            ->where('is_active', true)
            ->get();

        if ($allergies->isEmpty()) {
            return [];
        }

        $warnings = [];
        $medicines = Medicine::whereIn('id', $medicineIds)->get();

        foreach ($medicines as $med) {
            $medName = strtolower($med->name);
            $genericName = strtolower($med->generic_name ?? '');

            foreach ($allergies as $allergy) {
                $allergen = strtolower($allergy->allergen);
                if (($medName && str_contains($medName, $allergen)) || ($genericName && str_contains($genericName, $allergen)) || ($allergen && (str_contains($medName, $allergen) || str_contains($allergen, $medName)))) {
                    $warnings[] = [
                        'medicine_id' => $med->id,
                        'medicine_name' => $med->name,
                        'allergen' => $allergy->allergen,
                        'severity' => $allergy->severity ?? 'severe',
                        'message' => "Patient allergy match: {$med->name} matches allergen {$allergy->allergen} (Severity: {$allergy->severity})",
                    ];
                }
            }
        }

        return $warnings;
    }

    public function checkDrugInteractions(array $medicineIds): array
    {
        $medicineIds = array_unique(array_filter($medicineIds));
        if (count($medicineIds) < 2) {
            return [];
        }

        $warnings = [];
        $count = count($medicineIds);

        for ($i = 0; $i < $count; $i++) {
            for ($j = $i + 1; $j < $count; $j++) {
                $med1 = $medicineIds[$i];
                $med2 = $medicineIds[$j];

                $interaction = DrugInteraction::findInteraction($med1, $med2);

                if ($interaction) {
                    $m1 = Medicine::find($med1);
                    $m2 = Medicine::find($med2);
                    $warnings[] = [
                        'medicine_1' => $m1?->name,
                        'medicine_2' => $m2?->name,
                        'severity' => $interaction->severity,
                        'description' => $interaction->description,
                        'recommendation' => $interaction->recommendation,
                        'message' => "Drug Interaction Warning ({$interaction->severity}): {$m1?->name} + {$m2?->name}",
                    ];
                }
            }
        }

        return $warnings;
    }
}
