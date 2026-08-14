<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignConsentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'signatures' => 'required|array|min:1',
            'signatures.*.signer_type' => 'required|in:patient,guardian,witness,provider',
            'signatures.*.signer_name' => 'required|string|max:255',
            'signatures.*.relationship' => 'nullable|string|max:100',
            'signatures.*.signature_data' => 'nullable|string',
            'signatures.*.signature_method' => 'required|in:digital,handwritten,typed',
            'signatures.*.notes' => 'nullable|string',
        ];
    }
}
