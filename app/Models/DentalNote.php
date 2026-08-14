<?php

namespace App\Models;

use Database\Factories\DentalNoteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalNote extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DentalNoteFactory::class;

    protected $fillable = [
        'patient_id',
        'dentist_id',
        'visit_id',
        'treatment_plan_id',
        'note_date',
        'clinical_notes',
        'treatment_performed',
        'prescriptions',
        'follow_up_instructions',
        'created_by',
    ];

    protected $casts = [
        'note_date' => 'date',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function treatmentPlan(): BelongsTo
    {
        return $this->belongsTo(DentalTreatmentPlan::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('note_date', $date);
    }

    public function scopeRecent($query, int $days = 365)
    {
        return $query->where('note_date', '>=', now()->subDays($days));
    }
}
