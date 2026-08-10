<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinalizePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('consultations.update');
    }

    public function rules(): array
    {
        return [];
    }
}
