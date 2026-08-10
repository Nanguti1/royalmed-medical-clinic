<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('visits.create');
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'visit_date' => 'nullable|date',
            'receptionist_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
