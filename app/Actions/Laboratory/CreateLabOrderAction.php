<?php

namespace App\Actions\Laboratory;

use App\Models\LabOrder;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Auth;

class CreateLabOrderAction
{
    public function execute(array $data): LabOrder
    {
        if (! isset($data['status'])) {
            $data['status'] = 'ordered';
        }

        if (! isset($data['ordered_by']) && Auth::check()) {
            $data['ordered_by'] = Auth::id();
        }

        if (empty($data['accession_number'])) {
            $data['accession_number'] = NumberGenerator::generateAccessionNumber();
        }

        return LabOrder::create($data);
    }
}
