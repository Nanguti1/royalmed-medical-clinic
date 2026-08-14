<?php

namespace App\Exceptions;

use Exception;

class DrugInteractionException extends Exception
{
    public static function majorInteraction(string $medicine1, string $medicine2, string $severity): self
    {
        return new self("Drug Interaction Warning ({$severity}): Severe interaction detected between {$medicine1} and {$medicine2}.");
    }
}
