<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;

class StartConsultationAction
{
    public function execute(array $data): Consultation
    {
        return Consultation::create($data);
    }
}
