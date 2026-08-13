<?php

namespace App\Actions\Vitals;

use App\Models\VitalSign;

class CaptureVitalsAction
{
    public function execute(array $data): VitalSign
    {
        if (! isset($data['bmi']) && ! empty($data['height_cm']) && ! empty($data['weight_kg'])) {
            $heightMeters = ((float) $data['height_cm']) / 100;

            if ($heightMeters > 0) {
                $data['bmi'] = round(((float) $data['weight_kg']) / ($heightMeters * $heightMeters), 2);
            }
        }

        return VitalSign::create($data);
    }
}
