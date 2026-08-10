<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLabOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('laboratory.order');
    }

    public function rules(): array
    {
        return [
            'visit_id' => 'required|exists:visits,id',
            'ordered_by' => 'nullable|exists:users,id',
            'tests' => 'nullable|array',
            'tests.*.lab_test_id' => 'required_with:tests|exists:lab_tests,id',
        ];
    }
}
