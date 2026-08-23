<?php

namespace App\Actions\Patients;

use App\Models\Patient;
use Illuminate\Support\Facades\Log;

class UpdatePatientAction
{
    public function execute(Patient $patient, array $data): Patient
    {
        // Extract sub-entities
        $identifiers = $data['identifiers'] ?? [];
        $contacts = $data['contacts'] ?? [];
        $addresses = $data['addresses'] ?? [];
        $emergencyContacts = $data['emergency_contacts'] ?? [];
        $relationships = $data['relationships'] ?? [];
        $allergies = $data['allergies'] ?? [];
        $chronicConditions = $data['chronic_conditions'] ?? [];
        $alerts = $data['alerts'] ?? [];

        // Check for shortcut identifiers in top-level payload
        $shortcutMap = [
            'national_id' => 'national_id',
            'passport_number' => 'passport',
            'sha_number' => 'sha_number',
            'nhif_number' => 'nhif_number',
            'insurance_number' => 'insurance_number',
        ];

        foreach ($shortcutMap as $field => $type) {
            if (! empty($data[$field])) {
                $identifiers[] = [
                    'identifier_type' => $type,
                    'identifier_value' => $data[$field],
                    'is_primary' => true,
                ];
            }
        }

        // Separate base patient attributes from nested relations
        $patientAttributes = array_diff_key($data, array_flip([
            'identifiers', 'contacts', 'addresses', 'emergency_contacts', 'relationships',
            'allergies', 'chronic_conditions', 'alerts', 'confirm_duplicate', 'ignore_duplicate_warning',
            'national_id', 'passport_number', 'sha_number', 'nhif_number', 'insurance_number',
        ]));

        if (! empty($patientAttributes)) {
            $patient->update($patientAttributes);
        }

        // Process sub-entities if provided
        foreach ($identifiers as $item) {
            if (! empty($item['identifier_type']) && ! empty($item['identifier_value'])) {
                $patient->identifiers()->updateOrCreate([
                    'identifier_type' => $item['identifier_type'],
                    'identifier_value' => $item['identifier_value'],
                ], [
                    'is_primary' => $item['is_primary'] ?? false,
                ]);
            }
        }

        foreach ($contacts as $item) {
            if (! empty($item['value'])) {
                if (isset($item['id'])) {
                    $patient->contacts()->where('id', $item['id'])->update($item);
                } else {
                    $patient->contacts()->create($item);
                }
            }
        }

        foreach ($addresses as $item) {
            if (! empty($item['address_line'])) {
                if (isset($item['id'])) {
                    $patient->addresses()->where('id', $item['id'])->update($item);
                } else {
                    $patient->addresses()->create($item);
                }
            }
        }

        foreach ($emergencyContacts as $item) {
            if (! empty($item['name'])) {
                if (isset($item['id'])) {
                    $patient->emergencyContacts()->where('id', $item['id'])->update($item);
                } else {
                    $patient->emergencyContacts()->create($item);
                }
            }
        }

        foreach ($relationships as $item) {
            if (! empty($item['relationship_type'])) {
                if (isset($item['id'])) {
                    $patient->relationships()->where('id', $item['id'])->update($item);
                } else {
                    $patient->relationships()->create($item);
                }
            }
        }

        foreach ($allergies as $item) {
            if (! empty($item['allergen'])) {
                if (isset($item['id'])) {
                    $patient->allergies()->where('id', $item['id'])->update($item);
                } else {
                    $item['recorded_by'] ??= $data['updated_by'] ?? null;
                    $item['recorded_at'] ??= now();
                    $patient->allergies()->create($item);
                }
            }
        }

        foreach ($chronicConditions as $item) {
            if (! empty($item['condition_name'])) {
                if (isset($item['id'])) {
                    $patient->chronicConditions()->where('id', $item['id'])->update($item);
                } else {
                    $item['recorded_by'] ??= $data['updated_by'] ?? null;
                    if (empty($item['diagnosed_on'])) {
                        $item['diagnosed_on'] = now();
                    }
                    $patient->chronicConditions()->create($item);
                }
            }
        }

        foreach ($alerts as $item) {
            if (! empty($item['title'])) {
                if (isset($item['id'])) {
                    $patient->alerts()->where('id', $item['id'])->update($item);
                } else {
                    $item['created_by'] ??= $data['updated_by'] ?? null;
                    if (empty($item['starts_at'])) {
                        $item['starts_at'] = now();
                    }
                    $patient->alerts()->create($item);
                }
            }
        }

        Log::info('Patient updated', ['patient_id' => $patient->id]);

        return $patient;
    }
}
