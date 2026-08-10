<?php

namespace App\Actions\Laboratory;

use App\Models\LabResult;

class RecordLabResultAction
{
    public function execute(array $data): LabResult
    {
        return LabResult::create($data);
    }
}
