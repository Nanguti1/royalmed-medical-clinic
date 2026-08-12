<?php

namespace App\Services;

use App\Actions\Patients\RegisterPatientAction;
use App\Actions\Patients\UpdatePatientAction;
use App\Models\Patient;
use Illuminate\Support\Facades\Auth;
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
            $data['created_by'] = Auth::id();
            $patient = $this->registerAction->execute($data);

            return $patient->load(['gender', 'county', 'sub_county', 'createdBy']);
        });
    }

    public function update(Patient $patient, array $data): Patient
    {
        return DB::transaction(function () use ($patient, $data) {
            $data['updated_by'] = Auth::id();
            $patient = $this->updateAction->execute($patient, $data);

            return $patient->load(['gender', 'county', 'sub_county', 'updatedBy']);
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

    public function delete(Patient $patient): bool
    {
        // Check if patient has visits (which would cascade to clinical/financial records)
        if ($patient->visits()->exists()) {
            throw new \RuntimeException('Cannot delete patient with associated visits. Use soft delete instead.');
        }

        return $patient->delete();
    }
}
