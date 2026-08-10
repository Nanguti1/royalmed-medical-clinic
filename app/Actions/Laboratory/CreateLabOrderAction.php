<?php

namespace App\Actions\Laboratory;

use App\Models\LabOrder;

class CreateLabOrderAction
{
    public function execute(array $data): LabOrder
    {
        if (! isset($data['status'])) {
            $data['status'] = 'ordered';
        }

        return LabOrder::create($data);
    }
}
