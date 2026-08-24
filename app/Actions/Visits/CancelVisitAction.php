<?php

namespace App\Actions\Visits;

use App\Exceptions\InvalidVisitStatusTransitionException;
use App\Models\QueueEntry;
use App\Models\Visit;
use Illuminate\Support\Facades\Auth;

class CancelVisitAction
{
    public function execute(Visit $visit): Visit
    {
        if (! $visit->canCancel()) {
            if ($visit->isCompleted()) {
                throw InvalidVisitStatusTransitionException::cannotCancelCompleted();
            }

            throw InvalidVisitStatusTransitionException::alreadyCancelled();
        }

        $visit->update([
            'cancelled_at' => now(),
            'cancelled_by' => Auth::id(),
        ]);

        // Remove all active queue entries for this visit
        QueueEntry::where('visit_id', $visit->id)
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->delete();

        return $visit;
    }
}
