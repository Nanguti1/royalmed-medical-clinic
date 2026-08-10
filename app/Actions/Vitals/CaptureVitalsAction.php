<?php

namespace App\Actions\Vitals;

use App\Models\VitalSign;

class CaptureVitalsAction
{
    public function execute(array $data): VitalSign
    {
        return VitalSign::create($data);
    }
}
