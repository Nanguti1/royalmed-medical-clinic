<?php

namespace App\Services;

use App\Exceptions\InvalidVisitStatusTransitionException;
use App\Models\Visit;

class VisitCompletionValidator
{
    /**
     * Validate that a visit can be completed based on its dependencies.
     *
     * @param  Visit  $visit  The visit to validate
     *
     * @throws InvalidVisitStatusTransitionException If visit cannot be completed
     */
    public function validate(Visit $visit): void
    {
        // A visit must be started before it can be completed
        if (! $visit->isStarted()) {
            throw new InvalidVisitStatusTransitionException('Cannot complete a visit that has not been started');
        }

        // Financial Rule 1: Invoice should exist for the visit
        if (! $visit->invoice) {
            throw new InvalidVisitStatusTransitionException('Cannot complete visit: invoice is required');
        }

        // Financial Rule 2: Invoice should be paid
        if (! $visit->invoice->isPaid()) {
            throw new InvalidVisitStatusTransitionException('Cannot complete visit: invoice must be paid');
        }

        // Optional Rule 3: If prescription exists, it should be finalized
        if ($visit->prescriptions->isNotEmpty()) {
            foreach ($visit->prescriptions as $prescription) {
                if (! $prescription->isFinalized()) {
                    throw new InvalidVisitStatusTransitionException('Cannot complete visit: prescription must be finalized');
                }
            }
        }

        // Optional Rule 4: If lab orders exist, they should be completed
        if ($visit->labOrders->isNotEmpty()) {
            foreach ($visit->labOrders as $labOrder) {
                if (! $labOrder->isCompleted()) {
                    throw new InvalidVisitStatusTransitionException('Cannot complete visit: lab orders must be completed');
                }
            }
        }
    }

    /**
     * Validate that a visit can be completed for demo purposes (relaxed rules).
     *
     * @param  Visit  $visit  The visit to validate
     *
     * @throws InvalidVisitStatusTransitionException If visit cannot be completed
     */
    public function validateForDemo(Visit $visit): void
    {
        // A visit must be started before it can be completed
        if (! $visit->isStarted()) {
            throw new InvalidVisitStatusTransitionException('Cannot complete a visit that has not been started');
        }

        // Relaxed rules for demo: no invoice requirement
        // Optional Rule 3: If prescription exists, it should be finalized
        if ($visit->prescriptions->isNotEmpty()) {
            foreach ($visit->prescriptions as $prescription) {
                if (! $prescription->isFinalized()) {
                    throw new InvalidVisitStatusTransitionException('Cannot complete visit: prescription must be finalized');
                }
            }
        }

        // Optional Rule 4: If lab orders exist, they should be completed
        if ($visit->labOrders->isNotEmpty()) {
            foreach ($visit->labOrders as $labOrder) {
                if (! $labOrder->isCompleted()) {
                    throw new InvalidVisitStatusTransitionException('Cannot complete visit: lab orders must be completed');
                }
            }
        }
    }

    /**
     * Check if a visit can be completed without throwing exceptions.
     *
     * @param  Visit  $visit  The visit to check
     * @return bool True if visit can be completed, false otherwise
     */
    public function canComplete(Visit $visit): bool
    {
        try {
            $this->validate($visit);

            return true;
        } catch (InvalidVisitStatusTransitionException) {
            return false;
        }
    }
}
