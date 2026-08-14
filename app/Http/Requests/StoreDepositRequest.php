<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'payment_id' => 'required|exists:payments,id',
            'amount' => 'required|numeric|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string',
        ];
    }
}
