<?php

namespace App\Exceptions;

use Exception;

class InvalidVisitStatusTransitionException extends Exception
{
    public static function cannotStartCompleted(): self
    {
        return new self('Cannot start a visit that has already been completed');
    }

    public static function cannotStartCancelled(): self
    {
        return new self('Cannot start a visit that has been cancelled');
    }

    public static function cannotCompleteUnstarted(): self
    {
        return new self('Cannot complete a visit that has not been started');
    }

    public static function cannotCompleteCancelled(): self
    {
        return new self('Cannot complete a visit that has been cancelled');
    }

    public static function cannotCompleteCompleted(): self
    {
        return new self('Cannot complete a visit that has already been completed');
    }

    public static function cannotCancelCompleted(): self
    {
        return new self('Cannot cancel a visit that has already been completed');
    }

    public static function alreadyStarted(): self
    {
        return new self('Visit has already been started');
    }

    public static function alreadyCancelled(): self
    {
        return new self('Visit has already been cancelled');
    }
}
