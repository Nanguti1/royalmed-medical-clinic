<?php

namespace App\Actions\Visits;

use App\Exceptions\InvalidVisitStatusTransitionException;
use App\Models\Visit;

class StartVisitAction
{
    public function execute(Visit $visit): Visit
    {
        if (! $visit->canStart()) {
            if ($visit->isCancelled()) {
                throw InvalidVisitStatusTransitionException::cannotStartCancelled();
            }

            if ($visit->isCompleted()) {
                throw InvalidVisitStatusTransitionException::cannotStartCompleted();
            }

            throw InvalidVisitStatusTransitionException::alreadyStarted();
        }

        $visit->update(['started_at' => now()]);

        return $visit;
    }
}
