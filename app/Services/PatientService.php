<?php

namespace App\Services;

use App\Actions\Patients\RegisterPatientAction;
use App\Actions\Patients\UpdatePatientAction;
use App\Models\EmergencyContact;
use App\Models\Patient;
use App\Models\PatientAddress;
use App\Models\PatientAlert;
use App\Models\PatientAllergy;
use App\Models\PatientChronicCondition;
use App\Models\PatientContact;
use App\Models\PatientIdentifier;
use App\Models\PatientMergeRecord;
use App\Models\PatientRelationship;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
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
            $data['created_by'] ??= Auth::id();
            $patient = $this->registerAction->execute($data);

            return $patient->load([
                'gender', 'county', 'sub_county', 'createdBy',
                'identifiers', 'contacts', 'addresses', 'emergencyContacts',
                'relationships', 'allergies', 'chronicConditions', 'alerts',
            ]);
        });
    }

    public function update(Patient $patient, array $data): Patient
    {
        return DB::transaction(function () use ($patient, $data) {
            $data['updated_by'] ??= Auth::id();
            $patient = $this->updateAction->execute($patient, $data);

            return $patient->load([
                'gender', 'county', 'sub_county', 'updatedBy',
                'identifiers', 'contacts', 'addresses', 'emergencyContacts',
                'relationships', 'allergies', 'chronicConditions', 'alerts',
            ]);
        });
    }

    public function findDuplicates(array $data, ?int $ignorePatientId = null): Collection
    {
        $query = Patient::with(['identifiers', 'contacts', 'gender']);

        if ($ignorePatientId) {
            $query->where('id', '!=', $ignorePatientId);
        }

        $query->where(function ($q) use ($data) {
            $hasCondition = false;

            if (! empty($data['first_name']) && ! empty($data['last_name'])) {
                $q->orWhere(function ($subQ) use ($data) {
                    $subQ->where('first_name', 'like', "%{$data['first_name']}%")
                        ->where('last_name', 'like', "%{$data['last_name']}%");

                    if (! empty($data['date_of_birth'])) {
                        $subQ->whereDate('date_of_birth', $data['date_of_birth']);
                    }
                });
                $hasCondition = true;
            }

            if (! empty($data['phone'])) {
                $q->orWhere('phone', $data['phone']);
                $q->orWhereHas('contacts', fn ($c) => $c->where('value', $data['phone']));
                $hasCondition = true;
            }

            if (! empty($data['email'])) {
                $q->orWhere('email', $data['email']);
                $q->orWhereHas('contacts', fn ($c) => $c->where('value', $data['email']));
                $hasCondition = true;
            }

            if (! empty($data['hospital_number'])) {
                $q->orWhere('hospital_number', $data['hospital_number']);
                $hasCondition = true;
            }

            $identifierValues = [];
            if (! empty($data['identifiers']) && is_array($data['identifiers'])) {
                foreach ($data['identifiers'] as $ident) {
                    if (! empty($ident['identifier_value'])) {
                        $identifierValues[] = $ident['identifier_value'];
                    }
                }
            }
            foreach (['national_id', 'passport_number', 'sha_number', 'nhif_number', 'insurance_number'] as $key) {
                if (! empty($data[$key])) {
                    $identifierValues[] = $data[$key];
                }
            }

            if (! empty($identifierValues)) {
                $q->orWhereHas('identifiers', fn ($i) => $i->whereIn('identifier_value', $identifierValues));
                $hasCondition = true;
            }

            if (! $hasCondition) {
                $q->whereRaw('1 = 0');
            }
        });

        return $query->get();
    }

    public function merge(Patient $sourcePatient, Patient $targetPatient, ?User $mergedBy = null, ?string $reason = null): PatientMergeRecord
    {
        if ($sourcePatient->id === $targetPatient->id) {
            throw new \InvalidArgumentException('Source and target patient cannot be the same patient.');
        }

        $mergedBy ??= Auth::user();
        $reason ??= 'Merged duplicate patient record.';

        return DB::transaction(function () use ($sourcePatient, $targetPatient, $mergedBy, $reason) {
            $sourcePatient->load([
                'identifiers', 'contacts', 'addresses', 'emergencyContacts',
                'relationships', 'allergies', 'chronicConditions', 'alerts', 'visits', 'clinicalAttachments',
            ]);

            $snapshot = $sourcePatient->toArray();

            $sourcePatient->visits()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->emergencyContacts()->update(['patient_id' => $targetPatient->id]);

            foreach ($sourcePatient->identifiers as $identifier) {
                $exists = $targetPatient->identifiers()
                    ->where('identifier_type', $identifier->identifier_type)
                    ->where('identifier_value', $identifier->identifier_value)
                    ->exists();

                if (! $exists) {
                    $identifier->update(['patient_id' => $targetPatient->id]);
                } else {
                    $identifier->delete();
                }
            }

            $sourcePatient->contacts()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->addresses()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->allergies()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->chronicConditions()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->alerts()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->relationships()->update(['patient_id' => $targetPatient->id]);
            $sourcePatient->relatedRelationships()->update(['related_patient_id' => $targetPatient->id]);
            $sourcePatient->clinicalAttachments()->update(['patient_id' => $targetPatient->id]);

            $mergeRecord = PatientMergeRecord::create([
                'source_patient_id' => $sourcePatient->id,
                'target_patient_id' => $targetPatient->id,
                'merged_patient_snapshot' => $snapshot,
                'reason' => $reason,
                'merged_by' => $mergedBy?->id,
                'merged_at' => now(),
            ]);

            $sourcePatient->delete();

            return $mergeRecord;
        });
    }

    public function isIdentifierUnique(string $type, string $value, ?int $ignorePatientId = null): bool
    {
        $query = PatientIdentifier::where('identifier_type', $type)
            ->where('identifier_value', $value)
            ->whereHas('patient', fn ($q) => $q->whereNull('deleted_at'));

        if ($ignorePatientId) {
            $query->where('patient_id', '!=', $ignorePatientId);
        }

        return ! $query->exists();
    }

    public function addIdentifier(Patient $patient, array $data): PatientIdentifier
    {
        if (! $this->isIdentifierUnique($data['identifier_type'], $data['identifier_value'], $patient->id)) {
            throw new \InvalidArgumentException("The identifier {$data['identifier_type']}: {$data['identifier_value']} is already assigned to another patient.");
        }

        return $patient->identifiers()->create($data);
    }

    public function addContact(Patient $patient, array $data): PatientContact
    {
        return $patient->contacts()->create($data);
    }

    public function addAddress(Patient $patient, array $data): PatientAddress
    {
        return $patient->addresses()->create($data);
    }

    public function addEmergencyContact(Patient $patient, array $data): EmergencyContact
    {
        return $patient->emergencyContacts()->create($data);
    }

    public function addRelationship(Patient $patient, array $data): PatientRelationship
    {
        return $patient->relationships()->create($data);
    }

    public function addAllergy(Patient $patient, array $data): PatientAllergy
    {
        $data['recorded_by'] ??= Auth::id();
        $data['recorded_at'] ??= now();

        return $patient->allergies()->create($data);
    }

    public function addChronicCondition(Patient $patient, array $data): PatientChronicCondition
    {
        $data['recorded_by'] ??= Auth::id();

        return $patient->chronicConditions()->create($data);
    }

    public function addAlert(Patient $patient, array $data): PatientAlert
    {
        $data['created_by'] ??= Auth::id();

        return $patient->alerts()->create($data);
    }

    public function search(string $q)
    {
        $query = Patient::with(['gender', 'county', 'sub_county', 'identifiers', 'activeAlerts', 'activeAllergies', 'activeChronicConditions']);

        if ($q) {
            $query->where(function ($query) use ($q) {
                $query->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('hospital_number', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhereHas('identifiers', fn ($i) => $i->where('identifier_value', 'like', "%{$q}%"));
            });
        }

        return $query->limit(50)->get();
    }

    public function delete(Patient $patient): bool
    {
        if ($patient->visits()->exists()) {
            throw new \RuntimeException('Cannot delete patient with associated visits. Use soft delete instead.');
        }

        return $patient->delete();
    }
}
