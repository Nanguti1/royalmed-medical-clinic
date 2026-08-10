<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CaptureVitalsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('visits.update');
    }

    public function rules(): array
    {
        return [
            'visit_id' => 'required|exists:visits,id',
            'temperature_c' => 'nullable|numeric',
            'blood_pressure' => 'nullable|string|max:50',
            'pulse' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'weight_kg' => 'nullable|numeric',
            'height_cm' => 'nullable|numeric',
        ];
    }
}
