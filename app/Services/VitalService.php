<?php

namespace App\Services;

use App\Actions\Vitals\CaptureVitalsAction;
use App\Models\VitalSign;
use Illuminate\Support\Facades\DB;

class VitalService
{
    protected CaptureVitalsAction $capture;

    public function __construct(CaptureVitalsAction $capture)
    {
        $this->capture = $capture;
    }

    public function capture(array $data): VitalSign
    {
        return DB::transaction(function () use ($data) {
            return $this->capture->execute($data);
        });
    }
}
