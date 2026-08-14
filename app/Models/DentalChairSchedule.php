<?php

namespace App\Models;

use Database\Factories\DentalChairScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalChairSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DentalChairScheduleFactory::class;

    protected $fillable = [
        'chair_name',
        'chair_number',
        'dentist_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
        'notes',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'dental_chair_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByDay($query, string $day)
    {
        return $query->where('day_of_week', $day);
    }

    public function scopeByChairNumber($query, string $chairNumber)
    {
        return $query->where('chair_number', $chairNumber);
    }
}
