<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispensePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pharmacy.dispense');
    }

    public function rules(): array
    {
        return [];
    }
}
