<?php

namespace App\Exceptions;

use Exception;

class InvalidInvoiceStatusTransitionException extends Exception
{
    public static function cannotPayCancelledInvoice(): self
    {
        return new self('Cannot record payment against a cancelled invoice.');
    }

    public static function invalidTransition(string $from, string $to): self
    {
        return new self("Invalid invoice status transition from {$from} to {$to}.");
    }
}
