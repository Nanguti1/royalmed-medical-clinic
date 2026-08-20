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
            return $this->createAction->execute($data);
        });
    }

    public function complete(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            return $this->completeAction->execute($visit);
        });
    }

    public function start(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            return $this->startAction->execute($visit);
        });
    }

    public function cancel(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            return $this->cancelAction->execute($visit);
        });
    }

    public function startTriage(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
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

            return $visit;
        });
    }

    public function completeTriage(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
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

            return $visit;
        });
    }

    protected function createConsultationQueueEntry(Visit $visit): void
    {
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
}
