<?php

namespace App\Models;

use Database\Factories\PreauthorizationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Preauthorization extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = PreauthorizationFactory::class;

    protected $fillable = [
        'authorization_number',
        'patient_id',
        'insurer_id',
        'insurance_scheme_id',
        'patient_coverage_id',
        'visit_id',
        'status',
        'authorized_amount',
        'used_amount',
        'requested_services',
        'diagnosis',
        'justification',
        'request_date',
        'approval_date',
        'expiry_date',
        'usage_date',
        'rejection_reason',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'authorized_amount' => 'decimal:2',
        'used_amount' => 'decimal:2',
        'request_date' => 'date',
        'approval_date' => 'date',
        'expiry_date' => 'date',
        'usage_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($preauth) {
            if (empty($preauth->authorization_number)) {
                $preauth->authorization_number = 'PRE'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

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

    public function patientCoverage(): BelongsTo
    {
        return $this->belongsTo(PatientCoverage::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeValid($query)
    {
        return $query->where('status', 'approved')
            ->where(function ($q) {
                $q->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'approved')
            ->where('expiry_date', '<', now());
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->authorized_amount - $this->used_amount);
    }

    public function isCurrentlyValid(): bool
    {
        return $this->status === 'approved' &&
            ($this->expiry_date === null || $this->expiry_date >= now());
    }

    public function isExpired(): bool
    {
        return $this->status === 'approved' && $this->expiry_date && $this->expiry_date < now();
    }

    public function canBeUsed(): bool
    {
        return $this->isCurrentlyValid() && $this->remaining_amount > 0;
    }

    public function useAmount(float $amount): void
    {
        $this->used_amount += $amount;
        if ($this->used_amount >= $this->authorized_amount) {
            $this->status = 'used';
            $this->usage_date = now();
        }
        $this->save();
    }
}
