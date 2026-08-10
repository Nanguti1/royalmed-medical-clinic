<?php

namespace App\Actions\Visits;

use App\Models\Visit;
use App\Support\Generators\NumberGenerator;

class CreateVisitAction
{
    public function execute(array $data): Visit
    {
        if (empty($data['visit_number'])) {
            $data['visit_number'] = NumberGenerator::generateVisitNumber();
        }

        return Visit::create($data);
    }
}
