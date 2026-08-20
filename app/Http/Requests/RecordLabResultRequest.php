<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecordLabResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('laboratory.result');
    }

    public function rules(): array
    {
        return [
            'lab_order_item_id' => 'required|exists:lab_order_items,id',
            'result_value' => 'required|string',
            'units' => 'nullable|string',
            'reference_range' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
