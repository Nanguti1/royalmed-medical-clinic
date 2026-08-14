<?php

namespace App\Actions\Patients;

use App\Models\Patient;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Log;

class RegisterPatientAction
{
    public function execute(array $data): Patient
    {
        $data['hospital_number'] = ! empty($data['hospital_number'])
            ? $data['hospital_number']
            : NumberGenerator::generateHospitalNumber();

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

        $patient = Patient::create($patientAttributes);

        // Sync/create sub-entities
        foreach ($identifiers as $item) {
            if (! empty($item['identifier_type']) && ! empty($item['identifier_value'])) {
                $patient->identifiers()->firstOrCreate([
                    'identifier_type' => $item['identifier_type'],
                    'identifier_value' => $item['identifier_value'],
                ], [
                    'is_primary' => $item['is_primary'] ?? false,
                ]);
            }
        }

        foreach ($contacts as $item) {
            if (! empty($item['value'])) {
                $patient->contacts()->create($item);
            }
        }

        foreach ($addresses as $item) {
            if (! empty($item['address_line'])) {
                $patient->addresses()->create($item);
            }
        }

        foreach ($emergencyContacts as $item) {
            if (! empty($item['name'])) {
                $patient->emergencyContacts()->create($item);
            }
        }

        foreach ($relationships as $item) {
            if (! empty($item['relationship'])) {
                $patient->relationships()->create($item);
            }
        }

        foreach ($allergies as $item) {
            if (! empty($item['allergen'])) {
                $item['recorded_by'] ??= $data['created_by'] ?? null;
                $item['recorded_at'] ??= now();
                $patient->allergies()->create($item);
            }
        }

        foreach ($chronicConditions as $item) {
            if (! empty($item['condition_name'])) {
                $item['recorded_by'] ??= $data['created_by'] ?? null;
                $patient->chronicConditions()->create($item);
            }
        }

        foreach ($alerts as $item) {
            if (! empty($item['title'])) {
                $item['created_by'] ??= $data['created_by'] ?? null;
                $patient->alerts()->create($item);
            }
        }

        Log::info('Patient registered', ['patient_id' => $patient->id]);

        return $patient;
    }
}
