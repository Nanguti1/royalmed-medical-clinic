<?php

namespace App\Actions\Queue;

use App\Exceptions\InvalidQueueStateException;
use App\Models\QueueEntry;
use App\Models\Visit;
use App\Support\Generators\NumberGenerator;

class AddToQueueAction
{
    public function execute(array $data): QueueEntry
    {
        $department = $data['department'] ?? 'consultation';

        // Check duplicate active queue entry in the same department
        $activeExists = QueueEntry::where('visit_id', $data['visit_id'])
            ->where('department', $department)
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->exists();

        if ($activeExists) {
            throw InvalidQueueStateException::activeEntryExists($department);
        }

        $data['department'] = $department;
        $data['status'] ??= 'waiting';

        // Auto-assign priority if normal/unspecified and patient vitals show critical NEWS score
        if (empty($data['priority']) || $data['priority'] === 'normal') {
            $visit = Visit::with(['vitalSign', 'patient'])->find($data['visit_id']);
            if ($visit) {
                $newsScore = $visit->vitalSign?->news_score;
                if ($newsScore !== null && $newsScore >= 7) {
                    $data['priority'] = 'emergency';
                } elseif ($newsScore !== null && $newsScore >= 5) {
                    $data['priority'] = 'urgent';
                }
            }
        }

        $data['priority'] ??= 'normal';
        $data['queue_number'] ??= NumberGenerator::generateQueueNumber($data['department']);

        if (! isset($data['position'])) {
            $maxPosition = QueueEntry::where('department', $data['department'])
                ->whereIn('status', ['waiting', 'called', 'in_progress'])
                ->max('position');
            $data['position'] = ($maxPosition ?? 0) + 1;
        }

        return QueueEntry::create($data);
    }
}
