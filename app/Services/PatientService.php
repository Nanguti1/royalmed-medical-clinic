<?php

namespace App\Services;

use App\Actions\Patients\RegisterPatientAction;
use App\Actions\Patients\UpdatePatientAction;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

class PatientService
{
    protected RegisterPatientAction $registerAction;

    protected UpdatePatientAction $updateAction;

    public function __construct(RegisterPatientAction $registerAction, UpdatePatientAction $updateAction)
    {
        $this->registerAction = $registerAction;
        $this->updateAction = $updateAction;
    }

    public function register(array $data): Patient
    {
        return DB::transaction(function () use ($data) {
            $patient = $this->registerAction->execute($data);

            return $patient->load(['gender', 'county', 'sub_county']);
        });
    }

    public function update(Patient $patient, array $data): Patient
    {
        return DB::transaction(function () use ($patient, $data) {
            $patient = $this->updateAction->execute($patient, $data);

            return $patient->load(['gender', 'county', 'sub_county']);
        });
    }

    public function search(string $q)
    {
        $query = Patient::with(['gender', 'county', 'sub_county']);

        if ($q) {
            $query->where(function ($query) use ($q) {
                $query->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        return $query->limit(50)->get();
    }
}
