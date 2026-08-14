<?php

namespace App\Exceptions;

use Exception;

class PatientAllergyException extends Exception
{
    public static function severeAllergy(string $allergen, string $severity): self
    {
        return new self("Cannot prescribe/dispense: Patient has a documented {$severity} allergy to {$allergen}.");
    }
}
