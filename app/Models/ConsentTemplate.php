<?php

namespace App\Models;

use Database\Factories\ConsentTemplateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsentTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = ConsentTemplateFactory::class;

    protected $fillable = [
        'code',
        'name',
        'category',
        'content',
        'description',
        'requires_signature',
        'requires_witness',
        'is_active',
        'validity_days',
        'minimum_age',
        'version',
        'effective_from',
        'effective_to',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'requires_signature' => 'boolean',
        'requires_witness' => 'boolean',
        'is_active' => 'boolean',
        'validity_days' => 'integer',
        'minimum_age' => 'integer',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
    ];

    public function patientConsents(): HasMany
    {
        return $this->hasMany(PatientConsent::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
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

    public function requiresAdultConsent(int $patientAge): bool
    {
        return $patientAge < $this->minimum_age;
    }
}
