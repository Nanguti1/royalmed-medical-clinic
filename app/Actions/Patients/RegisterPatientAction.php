<?php

namespace App\Actions\Patients;

use App\Models\Patient;
use Illuminate\Support\Facades\Log;

class RegisterPatientAction
{
    public function execute(array $data): Patient
    {
        $patient = Patient::create($data);
        Log::info('Patient registered', ['patient_id' => $patient->id]);

        return $patient;
    }
}
