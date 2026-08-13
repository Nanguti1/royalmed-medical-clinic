<?php

namespace App\Actions\Patients;

use App\Models\Patient;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Log;

class RegisterPatientAction
{
    public function execute(array $data): Patient
    {
        $data['hospital_number'] ??= NumberGenerator::generateHospitalNumber();

        $patient = Patient::create($data);
        Log::info('Patient registered', ['patient_id' => $patient->id]);

        return $patient;
    }
}
