<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('patients.update');
    }

    public function rules(): array
    {
        return [
            'hospital_number' => ['nullable', 'string', 'max:255', Rule::unique('patients', 'hospital_number')->ignore($this->route('patient'))],
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
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
        ];
    }
}
