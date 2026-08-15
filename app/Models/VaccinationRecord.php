<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VaccinationRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'record_number',
        'patient_id',
        'vaccine_id',
        'visit_id',
        'administered_by',
        'administration_date',
        'dose_number',
        'batch_number',
        'expiry_date',
        'site',
        'route',
        'dosage',
        'dosage_unit',
        'reactions',
        'notes',
        'next_due_date',
        'status',
    ];

    protected $casts = [
        'administration_date' => 'date',
        'expiry_date' => 'date',
        'dosage' => 'decimal:3',
        'next_due_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($record) {
            if (empty($record->record_number)) {
                $record->record_number = 'VAC'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function administeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administered_by');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(VaccinationReminder::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(VaccinationCertificate::class);
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByVaccine($query, int $vaccineId)
    {
        return $query->where('vaccine_id', $vaccineId);
    }

    public function scopeAdministered($query)
    {
        return $query->where('status', 'administered');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeDue($query)
    {
        return $query->where('next_due_date', '<=', now())->where('status', 'administered');
    }

    public function scopeOverdue($query)
    {
        return $query->where('next_due_date', '<', now())->where('status', 'administered');
    }

    public function isAdministered(): bool
    {
        return $this->status === 'administered';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isDeferred(): bool
    {
        return $this->status === 'deferred';
    }

    public function isContraindicated(): bool
    {
        return $this->status === 'contraindicated';
    }

    public function isOverdue(): bool
    {
        return $this->next_due_date && $this->next_due_date < now();
    }

    public function defer(): void
    {
        $this->status = 'deferred';
        $this->save();
    }

    public function markAsContraindicated(): void
    {
        $this->status = 'contraindicated';
        $this->save();
    }

    public function calculateNextDueDate(): ?Carbon
    {
        $vaccine = $this->vaccine;
        if (! $vaccine || ! $vaccine->interval_days) {
            return null;
        }

        return $this->administration_date->addDays($vaccine->interval_days);
    }
}
