<?php

namespace App\Actions\Laboratory;

use App\Models\LabOrder;
use Illuminate\Support\Facades\Auth;

class CreateLabOrderAction
{
    public function execute(array $data): LabOrder
    {
        if (! isset($data['status'])) {
            $data['status'] = 'ordered';
        }

        $data['ordered_by'] = Auth::id();

        return LabOrder::create($data);
    }
}
