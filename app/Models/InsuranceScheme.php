<?php

namespace App\Models;

use Database\Factories\InsuranceSchemeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InsuranceScheme extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = InsuranceSchemeFactory::class;

    protected $fillable = [
        'insurer_id',
        'code',
        'name',
        'description',
        'scheme_type',
        'coverage_limit',
        'co_payment_amount',
        'co_payment_percentage',
        'requires_preauthorization',
        'is_active',
        'effective_from',
        'effective_to',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'coverage_limit' => 'decimal:2',
        'co_payment_amount' => 'decimal:2',
        'co_payment_percentage' => 'decimal:2',
        'requires_preauthorization' => 'boolean',
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    public function insurer(): BelongsTo
    {
        return $this->belongsTo(Insurer::class);
    }

    public function patientCoverages(): HasMany
    {
        return $this->hasMany(PatientCoverage::class);
    }

    public function employerSchemes(): HasMany
    {
        return $this->hasMany(EmployerScheme::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    public function preauthorizations(): HasMany
    {
        return $this->hasMany(Preauthorization::class);
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

    public function scopeByType($query, string $type)
    {
        return $query->where('scheme_type', $type);
    }

    public function isCurrentlyValid(): bool
    {
        $fromValid = $this->effective_from === null || $this->effective_from <= now();
        $toValid = $this->effective_to === null || $this->effective_to >= now();

        return $this->is_active && $fromValid && $toValid;
    }
}
