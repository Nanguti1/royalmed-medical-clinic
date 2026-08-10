<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('visits.update');
    }

    public function rules(): array
    {
        return [];
    }
}
