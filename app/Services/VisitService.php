<?php

namespace App\Services;

use App\Actions\Visits\CancelVisitAction;
use App\Actions\Visits\CompleteVisitAction;
use App\Actions\Visits\CreateVisitAction;
use App\Actions\Visits\StartVisitAction;
use App\Models\QueueEntry;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\DB;

class VisitService
{
    protected CreateVisitAction $createAction;

    protected CompleteVisitAction $completeAction;

    protected StartVisitAction $startAction;

    protected CancelVisitAction $cancelAction;

    public function __construct(CreateVisitAction $createAction, CompleteVisitAction $completeAction, StartVisitAction $startAction, CancelVisitAction $cancelAction)
    {
        $this->createAction = $createAction;
        $this->completeAction = $completeAction;
        $this->startAction = $startAction;
        $this->cancelAction = $cancelAction;
    }

    public function create(array $data): Visit
    {
        return DB::transaction(function () use ($data) {
            $visit = $this->createAction->execute($data);
            $visit->logActivity('visit.created', ['patient_id' => $visit->patient_id]);

            return $visit;
        });
    }

    public function complete(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            // Prevent completing already completed or cancelled visits
            if ($visit->isCompleted()) {
                throw new \RuntimeException('Visit is already completed.');
            }

            if ($visit->isCancelled()) {
                throw new \RuntimeException('Cannot complete a cancelled visit.');
            }

            $visit = $this->completeAction->execute($visit);
            $visit->logActivity('visit.completed');

            return $visit;
        });
    }

    public function start(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            // Prevent starting already completed or cancelled visits
            if ($visit->isCompleted()) {
                throw new \RuntimeException('Cannot start a completed visit.');
            }

            if ($visit->isCancelled()) {
                throw new \RuntimeException('Cannot start a cancelled visit.');
            }

            if ($visit->isStarted()) {
                throw new \RuntimeException('Visit is already started.');
            }

            $visit = $this->startAction->execute($visit);
            $visit->logActivity('visit.started');

            return $visit;
        });
    }

    public function cancel(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            // Prevent cancelling already completed or cancelled visits
            if ($visit->isCompleted()) {
                throw new \RuntimeException('Cannot cancel a completed visit.');
            }

            if ($visit->isCancelled()) {
                throw new \RuntimeException('Visit is already cancelled.');
            }

            $visit = $this->cancelAction->execute($visit);
            $visit->logActivity('visit.cancelled');

            return $visit;
        });
    }

    public function startTriage(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            // Prevent triage on completed or cancelled visits
            if ($visit->isCompleted()) {
                throw new \RuntimeException('Cannot start triage on a completed visit.');
            }

            if ($visit->isCancelled()) {
                throw new \RuntimeException('Cannot start triage on a cancelled visit.');
            }

            $triageInProgressStatus = VisitStatus::where('code', 'TRIAGE_IN_PROGRESS')->first();
            if ($triageInProgressStatus) {
                $visit->update(['visit_status_id' => $triageInProgressStatus->id]);
            }

            // Update triage queue entry to in_progress
            $triageQueueEntry = QueueEntry::where('visit_id', $visit->id)
                ->where('department', 'triage')
                ->whereIn('status', ['waiting', 'called'])
                ->first();

            if ($triageQueueEntry) {
                $triageQueueEntry->update([
                    'status' => 'in_progress',
                    'started_at' => now(),
                    'waiting_minutes' => $triageQueueEntry->created_at?->diffInMinutes(now()),
                ]);
            }

            $visit->logActivity('visit.triage_started');

            return $visit;
        });
    }

    public function completeTriage(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            // Prevent completing triage on completed or cancelled visits
            if ($visit->isCompleted()) {
                throw new \RuntimeException('Cannot complete triage on a completed visit.');
            }

            if ($visit->isCancelled()) {
                throw new \RuntimeException('Cannot complete triage on a cancelled visit.');
            }

            // Start the visit if not already started
            if (! $visit->isStarted()) {
                $this->start($visit);
            }

            $waitingForConsultationStatus = VisitStatus::where('code', 'WAITING_FOR_CONSULTATION')->first();
            if ($waitingForConsultationStatus) {
                $visit->update(['visit_status_id' => $waitingForConsultationStatus->id]);
            }

            // Complete triage queue entry
            $triageQueueEntry = QueueEntry::where('visit_id', $visit->id)
                ->where('department', 'triage')
                ->whereIn('status', ['waiting', 'called', 'in_progress'])
                ->first();

            if ($triageQueueEntry) {
                $triageQueueEntry->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
            }

            // Create consultation queue entry
            $this->createConsultationQueueEntry($visit);

            $visit->logActivity('visit.triage_completed');

            return $visit;
        });
    }

    protected function createConsultationQueueEntry(Visit $visit): void
    {
        // Prevent creating queue entries for completed or cancelled visits
        if ($visit->isCompleted() || $visit->isCancelled()) {
            return;
        }

        // Check if there's already an active consultation queue entry
        $existingEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'consultation')
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->first();

        if (! $existingEntry) {
            QueueEntry::create([
                'visit_id' => $visit->id,
                'department' => 'consultation',
                'status' => 'waiting',
                'priority' => 'normal',
                'queue_number' => NumberGenerator::generateQueueNumber('consultation'),
                'position' => QueueEntry::where('department', 'consultation')
                    ->whereIn('status', ['waiting', 'called', 'in_progress'])
                    ->max('position') + 1,
            ]);
        }
    }

    public function completeConsultation(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            // Prevent completing consultation for completed or cancelled visits
            if ($visit->isCompleted()) {
                throw new \RuntimeException('Cannot complete consultation for a completed visit.');
            }

            if ($visit->isCancelled()) {
                throw new \RuntimeException('Cannot complete consultation for a cancelled visit.');
            }

            $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
            if ($waitingForPrescriptionStatus) {
                $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);
            }

            // Complete consultation queue entry
            $consultationQueueEntry = QueueEntry::where('visit_id', $visit->id)
                ->where('department', 'consultation')
                ->whereIn('status', ['waiting', 'called', 'in_progress'])
                ->first();

            if ($consultationQueueEntry) {
                $consultationQueueEntry->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
            }

            $visit->logActivity('visit.consultation_completed');

            return $visit;
        });
    }
}
