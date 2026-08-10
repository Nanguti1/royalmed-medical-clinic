<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;

class UpdateConsultationAction
{
    public function execute(Consultation $consultation, array $data): Consultation
    {
        $consultation->update($data);

        return $consultation;
    }
}
