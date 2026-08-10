<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = ['patient_id', 'visit_date', 'visit_status_id', 'notes', 'receptionist_id', 'visit_number', 'started_at', 'completed_at', 'cancelled_at'];

    protected $casts = [
        'visit_date' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function status()
    {
        return $this->belongsTo(VisitStatus::class, 'visit_status_id');
    }

    public function vitalSign()
    {
        return $this->hasOne(VitalSign::class);
    }

    public function consultation()
    {
        return $this->hasOne(Consultation::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function labOrders()
    {
        return $this->hasMany(LabOrder::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function queueEntry()
    {
        return $this->hasOne(QueueEntry::class);
    }

    public function isStarted(): bool
    {
        return ! is_null($this->started_at);
    }

    public function isCompleted(): bool
    {
        return ! is_null($this->completed_at);
    }

    public function isCancelled(): bool
    {
        return ! is_null($this->cancelled_at);
    }

    public function canStart(): bool
    {
        return ! $this->isStarted() && ! $this->isCompleted() && ! $this->isCancelled();
    }

    public function canComplete(): bool
    {
        return $this->isStarted() && ! $this->isCompleted() && ! $this->isCancelled();
    }

    public function canCancel(): bool
    {
        return ! $this->isCompleted() && ! $this->isCancelled();
    }
}
