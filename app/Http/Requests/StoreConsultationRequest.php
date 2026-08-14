<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('consultations.create');
    }

    public function rules(): array
    {
        return [
            'visit_id' => 'required|exists:visits,id',
            'provider_id' => 'nullable|exists:users,id',
            'chief_complaint' => 'nullable|string',
            'history' => 'nullable|string',
            'examination' => 'nullable|string',
            'plan' => 'nullable|string',
            'notes' => 'nullable|string',
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_notes' => 'nullable|string',
            'follow_up_type' => 'nullable|string|max:100',

            'diagnoses' => 'nullable|array',
            'diagnoses.*.code' => 'nullable|string|max:100',
            'diagnoses.*.coding_system' => 'nullable|string|max:100',
            'diagnoses.*.description' => 'required_with:diagnoses|string|max:500',
            'diagnoses.*.diagnosis_type' => 'nullable|string|in:primary,differential',
            'diagnoses.*.certainty' => 'nullable|string|max:100',
            'diagnoses.*.rank' => 'nullable|integer',
        ];
    }
}
