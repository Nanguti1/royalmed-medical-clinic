<?php

namespace App\Models;

use Database\Factories\VaccinationScheduleItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaccinationScheduleItem extends Model
{
    use HasFactory;

    protected static $factory = VaccinationScheduleItemFactory::class;

    protected $fillable = [
        'vaccination_schedule_id',
        'vaccine_id',
        'dose_number',
        'min_age_months',
        'max_age_months',
        'recommended_age_months',
    ];

    protected $casts = [
        'dose_number' => 'integer',
        'min_age_months' => 'integer',
        'max_age_months' => 'integer',
        'recommended_age_months' => 'integer',
    ];

    public function vaccinationSchedule(): BelongsTo
    {
        return $this->belongsTo(VaccinationSchedule::class);
    }

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function scopeByDose($query, int $doseNumber)
    {
        return $query->where('dose_number', $doseNumber);
    }

    public function scopeByVaccine($query, int $vaccineId)
    {
        return $query->where('vaccine_id', $vaccineId);
    }

    public function isApplicableForAge(int $ageMonths): bool
    {
        $minValid = $this->min_age_months === null || $ageMonths >= $this->min_age_months;
        $maxValid = $this->max_age_months === null || $ageMonths <= $this->max_age_months;

        return $minValid && $maxValid;
    }
}
