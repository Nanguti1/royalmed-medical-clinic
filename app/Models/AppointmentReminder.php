<?php

namespace App\Models;

use Database\Factories\AppointmentReminderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentReminder extends Model
{
    use HasFactory;

    protected static $factory = AppointmentReminderFactory::class;

    protected $fillable = [
        'appointment_id',
        'reminder_type',
        'is_sent',
        'scheduled_at',
        'sent_at',
        'message',
        'status',
        'error_message',
    ];

    protected $casts = [
        'is_sent' => 'boolean',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function scopeSent($query)
    {
        return $query->where('is_sent', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_sent', false)->where('scheduled_at', '<=', now());
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('reminder_type', $type);
    }

    public function markAsSent(string $status = 'success'): void
    {
        $this->is_sent = true;
        $this->sent_at = now();
        $this->status = $status;
        $this->save();
    }

    public function markAsFailed(string $error): void
    {
        $this->is_sent = true;
        $this->sent_at = now();
        $this->status = 'failed';
        $this->error_message = $error;
        $this->save();
    }
}
