<?php

namespace App\Actions\Prescriptions;

use App\Models\Prescription;

class CreatePrescriptionAction
{
    public function execute(array $data): Prescription
    {
        return Prescription::create($data);
    }
}
