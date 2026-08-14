<?php

namespace App\Exceptions;

use Exception;

class InvalidQueueStateException extends Exception
{
    public static function cannotCallServed(): self
    {
        return new self('Cannot call a queue entry that has already been served');
    }

    public static function cannotCallCalled(): self
    {
        return new self('Queue entry has already been called');
    }

    public static function cannotServeUncalled(): self
    {
        return new self('Cannot serve a queue entry that has not been called');
    }

    public static function cannotServeServed(): self
    {
        return new self('Queue entry has already been served');
    }

    public static function cannotRemoveServed(): self
    {
        return new self('Cannot remove a queue entry that has already been served');
    }

    public static function activeEntryExists(string $department): self
    {
        return new self("An active queue entry already exists for this visit in the {$department} department.");
    }

    public static function invalidStatus(string $from, string $to): self
    {
        return new self("Invalid queue status transition from {$from} to {$to}");
    }
}
