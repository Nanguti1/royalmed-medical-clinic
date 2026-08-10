<?php

namespace App\Actions\Patients;

use App\Models\Patient;
use Illuminate\Support\Facades\Log;

class UpdatePatientAction
{
    public function execute(Patient $patient, array $data): Patient
    {
        $patient->update($data);
        Log::info('Patient updated', ['patient_id' => $patient->id]);

        return $patient;
    }
}
