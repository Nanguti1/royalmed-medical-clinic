<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'installment_count' => 'required|integer|min:1|max:60',
            'frequency' => 'required|in:weekly,biweekly,monthly',
            'start_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ];
    }
}
