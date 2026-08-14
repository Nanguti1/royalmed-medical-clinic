<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsentTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:consent_templates,code',
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'content' => 'required|string',
            'description' => 'nullable|string',
            'requires_signature' => 'boolean',
            'requires_witness' => 'boolean',
            'is_active' => 'boolean',
            'validity_days' => 'nullable|integer|min:1',
            'minimum_age' => 'nullable|integer|min:0|max:21',
            'version' => 'required|string|max:20',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ];
    }
}
