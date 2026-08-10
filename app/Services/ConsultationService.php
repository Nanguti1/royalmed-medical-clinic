<?php

namespace App\Services;

use App\Actions\Consultations\StartConsultationAction;
use App\Actions\Consultations\UpdateConsultationAction;
use App\Models\Consultation;
use Illuminate\Support\Facades\DB;

class ConsultationService
{
    protected StartConsultationAction $startAction;

    protected UpdateConsultationAction $updateAction;

    public function __construct(StartConsultationAction $startAction, UpdateConsultationAction $updateAction)
    {
        $this->startAction = $startAction;
        $this->updateAction = $updateAction;
    }

    public function start(array $data): Consultation
    {
        return DB::transaction(function () use ($data) {
            return $this->startAction->execute($data);
        });
    }

    public function update(Consultation $consultation, array $data): Consultation
    {
        return DB::transaction(function () use ($consultation, $data) {
            return $this->updateAction->execute($consultation, $data);
        });
    }
}
