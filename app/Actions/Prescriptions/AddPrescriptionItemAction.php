<?php

namespace App\Actions\Prescriptions;

use App\Exceptions\InvalidPrescriptionStatusException;
use App\Models\Prescription;
use App\Models\PrescriptionItem;

class AddPrescriptionItemAction
{
    public function execute(array $data): PrescriptionItem
    {
        $prescription = Prescription::find($data['prescription_id']);

        if ($prescription && ! $prescription->canAddItem()) {
            throw InvalidPrescriptionStatusException::cannotAddItemToFinalized();
        }

        return PrescriptionItem::create($data);
    }
}
