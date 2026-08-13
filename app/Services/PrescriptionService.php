<?php

namespace App\Services;

use App\Actions\Prescriptions\AddPrescriptionItemAction;
use App\Actions\Prescriptions\CreatePrescriptionAction;
use App\Actions\Prescriptions\CreatePrescriptionWithItemsAction;
use App\Actions\Prescriptions\DispensePrescriptionAction;
use App\Actions\Prescriptions\FinalizePrescriptionAction;
use App\Models\Medicine;
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
}
