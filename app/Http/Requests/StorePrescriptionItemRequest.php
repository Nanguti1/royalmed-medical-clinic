<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pharmacy.dispense');
    }

    public function rules(): array
    {
        return [
            'prescription_id' => 'required|exists:prescriptions,id',
            'medicine_id' => 'required|exists:medicines,id',
            'dosage_unit_id' => 'nullable|exists:dosage_units,id',
            'frequency_id' => 'nullable|exists:frequencies,id',
            'route_id' => 'nullable|exists:routes,id',
            'duration_unit_id' => 'nullable|exists:duration_units,id',
            'duration_quantity' => 'nullable|numeric',
            'quantity' => 'required|numeric|min:0.01',
            'instructions' => 'nullable|string',
        ];
    }
}
