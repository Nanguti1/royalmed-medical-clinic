<?php

namespace App\Models;

use Database\Factories\EmployerSchemeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployerScheme extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = EmployerSchemeFactory::class;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'insurer_id',
        'insurance_scheme_id',
        'account_number',
        'credit_limit',
        'current_balance',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function insurer(): BelongsTo
    {
        return $this->belongsTo(Insurer::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(InsuranceScheme::class, 'insurance_scheme_id');
    }

    public function patientEmployerCoverage(): HasMany
    {
        return $this->hasMany(PatientEmployerCoverage::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
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
        return $query->where('is_active', true);
    }

    public function getAvailableCreditAttribute(): float
    {
        return max(0, $this->credit_limit - $this->current_balance);
    }

    public function hasAvailableCredit(float $amount): bool
    {
        return $this->available_credit >= $amount;
    }
}
