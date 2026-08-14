<?php

namespace App\Models;

use Database\Factories\VaccinationScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VaccinationSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = VaccinationScheduleFactory::class;

    protected $fillable = [
        'schedule_name',
        'description',
        'schedule_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scheduleItems(): HasMany
    {
        return $this->hasMany(VaccinationScheduleItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRoutine($query)
    {
        return $query->where('schedule_type', 'routine');
    }

    public function scopeCatchUp($query)
    {
        return $query->where('schedule_type', 'catch_up');
    }

    public function scopeSpecial($query)
    {
        return $query->where('schedule_type', 'special');
    }
}
