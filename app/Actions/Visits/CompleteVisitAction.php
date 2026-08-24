<?php

namespace App\Actions\Visits;

use App\Events\VisitCompleted;
use App\Exceptions\InvalidVisitStatusTransitionException;
use App\Models\QueueEntry;
use App\Models\Visit;
use App\Services\VisitCompletionValidator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CompleteVisitAction
{
    protected VisitCompletionValidator $completionValidator;

    public function __construct(VisitCompletionValidator $completionValidator)
    {
        $this->completionValidator = $completionValidator;
    }

    public function execute(Visit $visit): Visit
    {
        if (! $visit->canComplete()) {
            if ($visit->isCancelled()) {
                throw InvalidVisitStatusTransitionException::cannotCompleteCancelled();
            }

            if (! $visit->isStarted()) {
                throw InvalidVisitStatusTransitionException::cannotCompleteUnstarted();
            }

            throw InvalidVisitStatusTransitionException::cannotCompleteCompleted();
        }

        // Validate completion prerequisites (use relaxed rules for demo)
        $this->completionValidator->validateForDemo($visit);

        $visit->update([
            'completed_at' => now(),
            'completed_by' => Auth::id(),
        ]);
        Log::info('Visit completed', ['visit_id' => $visit->id]);

        // Complete all active queue entries for this visit
        QueueEntry::where('visit_id', $visit->id)
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

        event(new VisitCompleted($visit));

        return $visit;
    }
}
