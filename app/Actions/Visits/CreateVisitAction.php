<?php

namespace App\Actions\Visits;

use App\Models\QueueEntry;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\DB;

class CreateVisitAction
{
    public function execute(array $data): Visit
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['visit_number'])) {
                $data['visit_number'] = NumberGenerator::generateVisitNumber();
            }

            // Set default status to WAITING_FOR_TRIAGE
            if (! isset($data['visit_status_id'])) {
                $waitingForTriageStatus = VisitStatus::where('code', 'WAITING_FOR_TRIAGE')->first();
                if ($waitingForTriageStatus) {
                    $data['visit_status_id'] = $waitingForTriageStatus->id;
                }
            }

            $visit = Visit::create($data);

            // Create triage queue entry
            $this->createTriageQueueEntry($visit);

            return $visit;
        });
    }

    protected function createTriageQueueEntry(Visit $visit): void
    {
        QueueEntry::create([
            'visit_id' => $visit->id,
            'department' => 'triage',
            'status' => 'waiting',
            'priority' => 'normal',
            'queue_number' => NumberGenerator::generateQueueNumber('triage'),
            'position' => QueueEntry::where('department', 'triage')
                ->whereIn('status', ['waiting', 'called', 'in_progress'])
                ->max('position') + 1,
        ]);
    }
}
