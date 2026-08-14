<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'nullable|exists:patients,id',
            'visit_id' => 'nullable|exists:visits,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'lab_result_id' => 'nullable|exists:lab_results,id',
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'file' => 'required|file|max:10240', // 10MB max
            'description' => 'nullable|string',
            'is_sensitive' => 'boolean',
            'is_confidential' => 'boolean',
            'expires_at' => 'nullable|date|after:today',
            'metadata' => 'nullable|array',
        ];
    }
}
