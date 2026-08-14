<?php

namespace App\Models;

use Database\Factories\PatientEmployerCoverageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientEmployerCoverage extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = PatientEmployerCoverageFactory::class;

    protected $fillable = [
        'patient_id',
        'employer_scheme_id',
        'employee_number',
        'department',
        'effective_from',
        'effective_to',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function employerScheme(): BelongsTo
    {
        return $this->belongsTo(EmployerScheme::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('effective_from')
                    ->orWhere('effective_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now());
            });
    }

    public function isCurrentlyValid(): bool
    {
        $fromValid = $this->effective_from === null || $this->effective_from <= now();
        $toValid = $this->effective_to === null || $this->effective_to >= now();

        return $this->is_active && $fromValid && $toValid;
    }
}
