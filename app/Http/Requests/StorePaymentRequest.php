<?php

namespace App\Http\Requests;

use App\Models\PaymentMethod;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('billing.create');
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'nullable|exists:invoices,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'amount' => 'required|numeric|min:0.01',
            'paid_at' => 'nullable|date',
            'reference' => 'nullable|string',
            'mpesa_transaction_id' => 'nullable|exists:mpesa_transactions,id',
            'mpesa' => 'nullable|array',
            'mpesa.transaction_id' => 'nullable|string|unique:mpesa_transactions,transaction_id',
            'mpesa.phone' => 'nullable|string',
            'mpesa.amount' => 'nullable|numeric|min:0.01',
            'mpesa.status' => 'nullable|string',
            'mpesa.occurred_at' => 'nullable|date',
            'mpesa.raw_response' => 'nullable|array',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $paymentMethodId = $this->input('payment_method_id');

            // Require M-Pesa transaction_id when M-Pesa payment method is selected
            if ($paymentMethodId) {
                $paymentMethod = PaymentMethod::find($paymentMethodId);
                if ($paymentMethod && strtolower($paymentMethod->name) === 'mpesa') {
                    if (empty($this->input('mpesa.transaction_id'))) {
                        $validator->errors()->add('mpesa.transaction_id', 'M-Pesa transaction reference is required for M-Pesa payments.');
                    }
                }
            }
        });
    }
}
