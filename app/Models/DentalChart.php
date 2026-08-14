<?php

namespace App\Models;

use Database\Factories\DentalChartFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalChart extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DentalChartFactory::class;

    protected $fillable = [
        'patient_id',
        'dentist_id',
        'visit_id',
        'chart_date',
        'chief_complaint',
        'medical_history',
        'dental_history',
        'oral_hygiene',
        'periodontal_status',
        'findings',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'chart_date' => 'date',
        'oral_hygiene' => 'array',
        'periodontal_status' => 'array',
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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function teeth(): HasMany
    {
        return $this->hasMany(DentalTooth::class);
    }

    public function treatmentPlans(): HasMany
    {
        return $this->hasMany(DentalTreatmentPlan::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(DentalAttachment::class);
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('chart_date', $date);
    }

    public function scopeRecent($query, int $days = 365)
    {
        return $query->where('chart_date', '>=', now()->subDays($days));
    }
}
