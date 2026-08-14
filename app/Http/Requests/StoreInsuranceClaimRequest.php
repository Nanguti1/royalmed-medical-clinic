<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInsuranceClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'patient_coverage_id' => 'required|exists:patient_coverages,id',
            'service_date_from' => 'required|date',
            'service_date_to' => 'required|date|after_or_equal:service_date_from',
            'notes' => 'nullable|string',
        ];
    }
}
