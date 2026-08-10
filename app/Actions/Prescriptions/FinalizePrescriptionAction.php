<?php

namespace App\Actions\Prescriptions;

use App\Events\PrescriptionFinalized;
use App\Exceptions\InvalidPrescriptionStatusException;
use App\Models\Prescription;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\DB;

class FinalizePrescriptionAction
{
    public function execute(Prescription $prescription): Prescription
    {
        if (! $prescription->canFinalize()) {
            if ($prescription->isFinalized()) {
                throw InvalidPrescriptionStatusException::cannotFinalizeFinalized();
            }

            throw InvalidPrescriptionStatusException::invalidStatus('draft', 'finalized');
        }

        return DB::transaction(function () use ($prescription) {
            $prescription->prescription_number = NumberGenerator::generatePrescriptionNumber();
            $prescription->finalized_at = now();
            $prescription->save();

            event(new PrescriptionFinalized($prescription));

            return $prescription;
        });
    }
}
