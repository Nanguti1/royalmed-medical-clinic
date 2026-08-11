<?php

namespace App\Exceptions;

use Exception;

class InvalidDispenseQuantityException extends Exception
{
    public static function exceedsPrescribedQuantity(int $itemId): self
    {
        return new self("Dispensed quantity exceeds prescribed quantity for item {$itemId}");
    }

    public static function negativeQuantity(): self
    {
        return new self('Dispensed quantity cannot be negative');
    }

    public static function zeroQuantity(): self
    {
        return new self('Dispensed quantity cannot be zero');
    }
}
