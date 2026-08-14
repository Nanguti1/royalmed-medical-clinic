<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_id' => 'required|exists:payments,id',
            'credit_note_id' => 'nullable|exists:credit_notes,id',
            'reason' => 'required|in:overpayment,service_cancellation,return,error,other',
            'amount' => 'required|numeric|min:0',
            'refund_method' => 'nullable|in:original,cash,bank_transfer',
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ];
    }
}
