<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MergePatientsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('patients.update');
    }

    public function rules(): array
    {
        $patientId = $this->route('patient')?->id ?? $this->route('patient');

        return [
            'target_patient_id' => [
                'required',
                'integer',
                'exists:patients,id',
                'different:patient',
            ],
            'reason' => 'required|string|max:1000',
        ];
    }
}
