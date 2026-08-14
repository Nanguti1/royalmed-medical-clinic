<?php

namespace App\Models;

use Database\Factories\WaitlistEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WaitlistEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = WaitlistEntryFactory::class;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'dental_chair_id',
        'appointment_type',
        'reason',
        'notes',
        'priority',
        'requested_date',
        'contacted_at',
        'status',
        'created_by',
    ];

    protected $casts = [
        'requested_date' => 'datetime',
        'contacted_at' => 'datetime',
    ];

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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    public function markAsContacted(): void
    {
        $this->status = 'contacted';
        $this->contacted_at = now();
        $this->save();
    }

    public function markAsScheduled(): void
    {
        $this->status = 'scheduled';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
