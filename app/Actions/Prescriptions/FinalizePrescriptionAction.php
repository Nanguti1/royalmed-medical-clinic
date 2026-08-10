<?php

namespace App\Actions\Prescriptions;

use App\Events\PrescriptionFinalized;
use App\Exceptions\InvalidPrescriptionStatusException;
use App\Models\Prescription;
use App\Support\Generators\NumberGenerator;

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

        $prescription->prescription_number = NumberGenerator::generatePrescriptionNumber();
        $prescription->finalized_at = now();
        $prescription->save();

        event(new PrescriptionFinalized($prescription));

        return $prescription;
    }
}
