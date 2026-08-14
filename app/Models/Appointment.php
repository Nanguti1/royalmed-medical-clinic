<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = AppointmentFactory::class;

    protected $fillable = [
        'appointment_number',
        'patient_id',
        'doctor_id',
        'dental_chair_id',
        'visit_id',
        'consultation_id',
        'appointment_date',
        'start_time',
        'end_time',
        'appointment_type',
        'status',
        'reason',
        'notes',
        'cancellation_reason',
        'is_walk_in',
        'is_follow_up',
        'checked_in_at',
        'checked_out_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
        'is_walk_in' => 'boolean',
        'is_follow_up' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($appointment) {
            if (empty($appointment->appointment_number)) {
                $appointment->appointment_number = 'APT'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function dentalChair(): BelongsTo
    {
        return $this->belongsTo(DentalChairSchedule::class, 'dental_chair_id');
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(AppointmentReminder::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeNoShow($query)
    {
        return $query->where('status', 'no_show');
    }

    public function scopeByDoctor($query, int $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('appointment_date', $date);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('appointment_date', '>=', now()->startOfDay());
    }

    public function scopePast($query)
    {
        return $query->where('appointment_date', '<', now()->startOfDay());
    }

    public function scopeWalkIn($query)
    {
        return $query->where('is_walk_in', true);
    }

    public function scopeFollowUp($query)
    {
        return $query->where('is_follow_up', true);
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isNoShow(): bool
    {
        return $this->status === 'no_show';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function checkIn(): void
    {
        $this->status = 'in_progress';
        $this->checked_in_at = now();
        $this->save();
    }

    public function checkOut(): void
    {
        $this->status = 'completed';
        $this->checked_out_at = now();
        $this->save();
    }

    public function cancel(string $reason): void
    {
        $this->status = 'cancelled';
        $this->cancellation_reason = $reason;
        $this->save();
    }

    public function markAsNoShow(): void
    {
        $this->status = 'no_show';
        $this->save();
    }

    public function confirm(): void
    {
        $this->status = 'confirmed';
        $this->save();
    }

    public function overlapsWith(Appointment $other): bool
    {
        if ($this->doctor_id !== $other->doctor_id) {
            return false;
        }

        if ($this->appointment_date->toDateString() !== $other->appointment_date->toDateString()) {
            return false;
        }

        $thisStart = Carbon::parse($this->start_time);
        $thisEnd = Carbon::parse($this->end_time);
        $otherStart = Carbon::parse($other->start_time);
        $otherEnd = Carbon::parse($other->end_time);

        return $thisStart < $otherEnd && $thisEnd > $otherStart;
    }

    public function getDurationAttribute(): int
    {
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);

        return $start->diffInMinutes($end);
    }
}
