<?php

namespace App\Models;

use Database\Factories\PatientCoverageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientCoverage extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = PatientCoverageFactory::class;

    protected $fillable = [
        'patient_id',
        'insurer_id',
        'insurance_scheme_id',
        'policy_number',
        'member_number',
        'member_name',
        'relationship',
        'principal_name',
        'principal_policy_number',
        'effective_from',
        'effective_to',
        'is_primary',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function insurer(): BelongsTo
    {
        return $this->belongsTo(Insurer::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(InsuranceScheme::class, 'insurance_scheme_id');
    }

    public function claims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    public function preauthorizations(): HasMany
    {
        return $this->hasMany(Preauthorization::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
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

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function isCurrentlyValid(): bool
    {
        $fromValid = $this->effective_from === null || $this->effective_from <= now();
        $toValid = $this->effective_to === null || $this->effective_to >= now();

        return $this->is_active && $fromValid && $toValid;
    }
}
