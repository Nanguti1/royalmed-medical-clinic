<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('consultations.update');
    }

    public function rules(): array
    {
        return [
            'chief_complaint' => 'nullable|string',
            'history' => 'nullable|string',
            'examination' => 'nullable|string',
            'plan' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
