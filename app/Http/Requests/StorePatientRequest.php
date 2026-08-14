<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('patients.create');
    }

    public function rules(): array
    {
        return [
            'hospital_number' => 'nullable|string|max:255|unique:patients,hospital_number',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'gender_id' => 'nullable|exists:genders,id',
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'photo_path' => 'nullable|string|max:2048',
            'occupation' => 'nullable|string|max:255',
            'employer' => 'nullable|string|max:255',
            'marital_status' => 'nullable|string|max:255',
            'preferred_language' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'blood_group' => 'nullable|string|max:10',
            'address' => 'nullable|string',
            'county_id' => 'nullable|exists:counties,id',
            'sub_county_id' => 'nullable|exists:sub_counties,id',
            'notes' => 'nullable|string',

            'national_id' => 'nullable|string|max:100',
            'passport_number' => 'nullable|string|max:100',
            'sha_number' => 'nullable|string|max:100',
            'nhif_number' => 'nullable|string|max:100',
            'insurance_number' => 'nullable|string|max:100',
            'confirm_duplicate' => 'nullable|boolean',

            'identifiers' => 'nullable|array',
            'identifiers.*.identifier_type' => 'required_with:identifiers.*.identifier_value|string|max:100',
            'identifiers.*.identifier_value' => 'required_with:identifiers.*.identifier_type|string|max:255',
            'identifiers.*.is_primary' => 'nullable|boolean',

            'contacts' => 'nullable|array',
            'contacts.*.type' => 'nullable|string|max:50',
            'contacts.*.value' => 'required_with:contacts|string|max:255',
            'contacts.*.label' => 'nullable|string|max:100',
            'contacts.*.is_primary' => 'nullable|boolean',
            'contacts.*.consent_to_contact' => 'nullable|boolean',

            'addresses' => 'nullable|array',
            'addresses.*.type' => 'nullable|string|max:50',
            'addresses.*.address_line' => 'required_with:addresses|string|max:500',
            'addresses.*.county_id' => 'nullable|exists:counties,id',
            'addresses.*.sub_county_id' => 'nullable|exists:sub_counties,id',
            'addresses.*.town' => 'nullable|string|max:100',
            'addresses.*.is_primary' => 'nullable|boolean',

            'emergency_contacts' => 'nullable|array',
            'emergency_contacts.*.name' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.relationship' => 'nullable|string|max:100',
            'emergency_contacts.*.phone' => 'nullable|string|max:50',
            'emergency_contacts.*.address' => 'nullable|string',

            'relationships' => 'nullable|array',
            'relationships.*.related_patient_id' => 'nullable|exists:patients,id',
            'relationships.*.relationship' => 'required_with:relationships|string|max:100',
            'relationships.*.name' => 'nullable|string|max:255',
            'relationships.*.phone' => 'nullable|string|max:50',
            'relationships.*.is_next_of_kin' => 'nullable|boolean',
            'relationships.*.is_emergency_contact' => 'nullable|boolean',

            'allergies' => 'nullable|array',
            'allergies.*.allergen' => 'required_with:allergies|string|max:255',
            'allergies.*.allergen_type' => 'nullable|string|max:100',
            'allergies.*.reaction' => 'nullable|string|max:255',
            'allergies.*.severity' => 'nullable|string|max:50',
            'allergies.*.is_active' => 'nullable|boolean',

            'chronic_conditions' => 'nullable|array',
            'chronic_conditions.*.condition_name' => 'required_with:chronic_conditions|string|max:255',
            'chronic_conditions.*.code' => 'nullable|string|max:100',
            'chronic_conditions.*.coding_system' => 'nullable|string|max:100',
            'chronic_conditions.*.diagnosed_on' => 'nullable|date',
            'chronic_conditions.*.is_active' => 'nullable|boolean',
            'chronic_conditions.*.notes' => 'nullable|string',

            'alerts' => 'nullable|array',
            'alerts.*.type' => 'nullable|string|max:50',
            'alerts.*.title' => 'required_with:alerts|string|max:255',
            'alerts.*.message' => 'nullable|string',
            'alerts.*.severity' => 'nullable|string|max:50',
            'alerts.*.is_active' => 'nullable|boolean',
            'alerts.*.starts_at' => 'nullable|date',
            'alerts.*.ends_at' => 'nullable|date',
        ];
    }
}
