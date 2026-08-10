<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionWithItemsRequest extends FormRequest
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
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.dosage_unit_id' => 'nullable|exists:dosage_units,id',
            'items.*.frequency_id' => 'nullable|exists:frequencies,id',
            'items.*.route_id' => 'nullable|exists:routes,id',
            'items.*.duration_unit_id' => 'nullable|exists:duration_units,id',
            'items.*.duration_quantity' => 'nullable|numeric',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.instructions' => 'nullable|string',
        ];
    }
}
