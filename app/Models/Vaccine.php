<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vaccine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'manufacturer',
        'batch_number_format',
        'route',
        'target_diseases',
        'doses_required',
        'min_age_months',
        'max_age_months',
        'interval_days',
        'is_active',
    ];

    protected $casts = [
        'target_diseases' => 'array',
        'doses_required' => 'integer',
        'min_age_months' => 'integer',
        'max_age_months' => 'integer',
        'interval_days' => 'integer',
        'is_active' => 'boolean',
    ];

    public function vaccinationRecords(): HasMany
    {
        return $this->hasMany(VaccinationRecord::class);
    }

    public function scheduleItems(): HasMany
    {
        return $this->hasMany(VaccinationScheduleItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRoute($query, string $route)
    {
        return $query->where('route', $route);
    }

    public function scopePreventsDisease($query, string $disease)
    {
        return $query->whereJsonContains('target_diseases', $disease);
    }

    public function preventsDisease(string $disease): bool
    {
        return in_array($disease, $this->target_diseases ?? []);
    }

    public function isApplicableForAge(int $ageMonths): bool
    {
        $minValid = $this->min_age_months === null || $ageMonths >= $this->min_age_months;
        $maxValid = $this->max_age_months === null || $ageMonths <= $this->max_age_months;

        return $minValid && $maxValid;
    }
}
