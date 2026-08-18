<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToQueueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('visits.create');
    }

    public function rules(): array
    {
        return [
            'department' => 'nullable|string|in:triage,consultation,laboratory,pharmacy,dental',
            'queue_number' => 'nullable|string|max:255',
            'position' => 'nullable|integer',
            'priority' => 'nullable|string|in:normal,urgent,emergency',
        ];
    }
}
