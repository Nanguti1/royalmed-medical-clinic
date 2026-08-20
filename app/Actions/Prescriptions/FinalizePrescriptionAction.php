<?php

namespace App\Actions\Prescriptions;

use App\Events\PrescriptionFinalized;
use App\Exceptions\InvalidPrescriptionStatusException;
use App\Models\Prescription;
use App\Models\QueueEntry;
use App\Models\VisitStatus;
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

            // Set visit status to WAITING_FOR_PHARMACY if visit exists and has items
            $prescription->load('items');
            if ($prescription->visit && $prescription->items->isNotEmpty()) {
                $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
                if ($waitingForPharmacyStatus) {
                    $prescription->visit->update(['visit_status_id' => $waitingForPharmacyStatus->id]);
                }

                // Create pharmacy queue entry if one doesn't already exist
                $this->createPharmacyQueueEntry($prescription);
            }

            event(new PrescriptionFinalized($prescription));

            // Log prescription finalization in visit timeline
            if ($prescription->visit) {
                $prescription->visit->logActivity('visit.prescription_finalized', [
                    'prescription_id' => $prescription->id,
                    'prescription_number' => $prescription->prescription_number,
                ]);
            }

            return $prescription;
        });
    }

    protected function createPharmacyQueueEntry(Prescription $prescription): void
    {
        // Check if there's already an active pharmacy queue entry for this visit
        $existingEntry = QueueEntry::where('visit_id', $prescription->visit_id)
            ->where('department', 'pharmacy')
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->first();

        if (! $existingEntry) {
            QueueEntry::create([
                'visit_id' => $prescription->visit_id,
                'department' => 'pharmacy',
                'status' => 'waiting',
                'priority' => 'normal',
                'queue_number' => NumberGenerator::generateQueueNumber('pharmacy'),
                'position' => QueueEntry::where('department', 'pharmacy')
                    ->whereIn('status', ['waiting', 'called', 'in_progress'])
                    ->max('position') + 1,
                'metadata' => [
                    'prescription_id' => $prescription->id,
                    'prescription_number' => $prescription->prescription_number,
                ],
            ]);
        }
    }
}
