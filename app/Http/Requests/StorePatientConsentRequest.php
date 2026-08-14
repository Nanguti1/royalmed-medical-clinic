<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientConsentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'consent_template_id' => 'required|exists:consent_templates,id',
            'visit_id' => 'nullable|exists:visits,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'notes' => 'nullable|string',
        ];
    }
}
