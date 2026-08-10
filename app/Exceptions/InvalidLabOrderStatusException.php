<?php

namespace App\Exceptions;

use Exception;

class InvalidLabOrderStatusException extends Exception
{
    public static function cannotAddTestToCompleted(): self
    {
        return new self('Cannot add tests to a completed lab order');
    }

    public static function cannotAddTestToInProgress(): self
    {
        return new self('Cannot add tests to a lab order that is in progress');
    }

    public static function cannotRecordResultForUnordered(): self
    {
        return new self('Cannot record result for a test that has not been ordered');
    }

    public static function cannotRecordResultForCompleted(): self
    {
        return new self('Cannot record result for a lab order that is already completed');
    }

    public static function invalidStatus(string $from, string $to): self
    {
        return new self("Invalid lab order status transition from {$from} to {$to}");
    }
}
