<?php

namespace App\Services;

use App\Actions\Queue\AddToQueueAction;
use App\Actions\Queue\CallQueueEntryAction;
use App\Actions\Queue\RemoveFromQueueAction;
use App\Actions\Queue\ServeQueueEntryAction;
use App\Exceptions\InvalidQueueStateException;
use App\Models\QueueEntry;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;

class QueueService
{
    protected AddToQueueAction $addAction;

    protected RemoveFromQueueAction $removeAction;

    protected CallQueueEntryAction $callAction;

    protected ServeQueueEntryAction $serveAction;

    public function __construct(AddToQueueAction $addAction, RemoveFromQueueAction $removeAction, CallQueueEntryAction $callAction, ServeQueueEntryAction $serveAction)
    {
        $this->addAction = $addAction;
        $this->removeAction = $removeAction;
        $this->callAction = $callAction;
        $this->serveAction = $serveAction;
    }

    public function add(array $data): QueueEntry
    {
        return DB::transaction(function () use ($data) {
            // Additional check for cancelled/completed visits
            if (isset($data['visit_id'])) {
                $visit = Visit::find($data['visit_id']);
                if ($visit && ($visit->isCompleted() || $visit->isCancelled())) {
                    throw InvalidQueueStateException::cannotQueueInactiveVisit();
                }
            }

            return $this->addAction->execute($data);
        });
    }

    public function remove(QueueEntry $entry): void
    {
        DB::transaction(function () use ($entry) {
            $this->removeAction->execute($entry);
        });
    }

    public function call(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            return $this->callAction->execute($entry);
        });
    }

    public function serve(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            return $this->serveAction->execute($entry);
        });
    }

    public function waiting(?string $department = null)
    {
        return $this->getWorklist($department, ['waiting']);
    }

    public function getWorklist(?string $department = null, array $statuses = ['waiting', 'called'])
    {
        $query = QueueEntry::with(['visit.patient.activeAlerts', 'visit.patient.activeAllergies', 'visit.vitalSign'])
            ->whereIn('status', $statuses);

        if ($department) {
            $query->where('department', $department);
        }

        return $query->orderByRaw("
            CASE priority
                WHEN 'emergency' THEN 1
                WHEN 'critical' THEN 2
                WHEN 'urgent' THEN 3
                WHEN 'high' THEN 4
                WHEN 'elderly' THEN 5
                WHEN 'child' THEN 6
                WHEN 'pregnant' THEN 7
                WHEN 'normal' THEN 8
                WHEN 'low' THEN 9
                ELSE 10
            END ASC,
            position ASC,
            created_at ASC
        ")->get();
    }

    public function start(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            if ($entry->isServed()) {
                throw InvalidQueueStateException::cannotServeServed();
            }

            $entry->update([
                'status' => 'in_progress',
                'started_at' => now(),
                'waiting_minutes' => $entry->created_at?->diffInMinutes(now()),
            ]);

            return $entry;
        });
    }

    public function skip(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            $entry->update(['status' => 'skipped']);

            return $entry;
        });
    }

    public function cancel(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            $entry->update(['status' => 'cancelled']);

            return $entry;
        });
    }
}
