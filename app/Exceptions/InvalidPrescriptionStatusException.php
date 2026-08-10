<?php

namespace App\Exceptions;

use Exception;

class InvalidPrescriptionStatusException extends Exception
{
    public static function cannotFinalizeFinalized(): self
    {
        return new self('Cannot finalize a prescription that has already been finalized');
    }

    public static function cannotAddItemToFinalized(): self
    {
        return new self('Cannot add items to a finalized prescription');
    }

    public static function cannotDispenseUnfinalized(): self
    {
        return new self('Cannot dispense a prescription that has not been finalized');
    }

    public static function cannotDispenseAlreadyDispensed(): self
    {
        return new self('Prescription has already been fully dispensed');
    }

    public static function invalidStatus(string $from, string $to): self
    {
        return new self("Invalid prescription status transition from {$from} to {$to}");
    }
}
