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

        if (! isset($data['news_score'])) {
            $data['news_score'] = self::calculateNewsScore($data);
        }

        return VitalSign::create($data);
    }

    public static function calculateNewsScore(array $data): ?int
    {
        $score = 0;
        $hasVitals = false;

        if (isset($data['respiratory_rate']) && is_numeric($data['respiratory_rate'])) {
            $rr = (int) $data['respiratory_rate'];
            $hasVitals = true;
            if ($rr <= 8) {
                $score += 3;
            } elseif ($rr <= 11) {
                $score += 1;
            } elseif ($rr <= 20) {
                $score += 0;
            } elseif ($rr <= 24) {
                $score += 2;
            } else {
                $score += 3;
            }
        }

        if (isset($data['oxygen_saturation']) && is_numeric($data['oxygen_saturation'])) {
            $spo2 = (float) $data['oxygen_saturation'];
            $hasVitals = true;
            if ($spo2 <= 91) {
                $score += 3;
            } elseif ($spo2 <= 93) {
                $score += 2;
            } elseif ($spo2 <= 95) {
                $score += 1;
            } else {
                $score += 0;
            }
        }

        if (isset($data['temperature_c']) && is_numeric($data['temperature_c'])) {
            $temp = (float) $data['temperature_c'];
            $hasVitals = true;
            if ($temp <= 35.0) {
                $score += 3;
            } elseif ($temp <= 36.0) {
                $score += 1;
            } elseif ($temp <= 38.0) {
                $score += 0;
            } elseif ($temp <= 39.0) {
                $score += 1;
            } else {
                $score += 2;
            }
        }

        if (! empty($data['blood_pressure'])) {
            $parts = explode('/', (string) $data['blood_pressure']);
            if (is_numeric(trim($parts[0]))) {
                $sbp = (int) trim($parts[0]);
                $hasVitals = true;
                if ($sbp <= 90) {
                    $score += 3;
                } elseif ($sbp <= 100) {
                    $score += 2;
                } elseif ($sbp <= 110) {
                    $score += 1;
                } elseif ($sbp <= 219) {
                    $score += 0;
                } else {
                    $score += 3;
                }
            }
        }

        if (isset($data['pulse']) && is_numeric($data['pulse'])) {
            $hr = (int) $data['pulse'];
            $hasVitals = true;
            if ($hr <= 40) {
                $score += 3;
            } elseif ($hr <= 50) {
                $score += 1;
            } elseif ($hr <= 90) {
                $score += 0;
            } elseif ($hr <= 110) {
                $score += 1;
            } elseif ($hr <= 130) {
                $score += 2;
            } else {
                $score += 3;
            }
        }

        return $hasVitals ? $score : null;
    }
}
