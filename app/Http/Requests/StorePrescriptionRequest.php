<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('consultations.create');
    }

    public function rules(): array
    {
        return [
            'visit_id' => 'required|exists:visits,id',
            'prescribed_by' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
