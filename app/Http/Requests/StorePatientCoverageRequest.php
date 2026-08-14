<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientCoverageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'insurer_id' => 'required|exists:insurers,id',
            'insurance_scheme_id' => 'nullable|exists:insurance_schemes,id',
            'policy_number' => 'required|string|max:100|unique:patient_coverages,policy_number',
            'member_number' => 'nullable|string|max:50',
            'member_name' => 'nullable|string|max:255',
            'relationship' => 'required|in:self,spouse,child,parent,other',
            'principal_name' => 'nullable|string|max:255',
            'principal_policy_number' => 'nullable|string|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ];
    }
}
