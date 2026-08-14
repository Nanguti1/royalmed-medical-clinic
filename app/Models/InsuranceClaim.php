<?php

namespace App\Models;

use Database\Factories\InsuranceClaimFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InsuranceClaim extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = InsuranceClaimFactory::class;

    protected $fillable = [
        'claim_number',
        'patient_id',
        'insurer_id',
        'insurance_scheme_id',
        'patient_coverage_id',
        'employer_scheme_id',
        'invoice_id',
        'status',
        'claimed_amount',
        'approved_amount',
        'rejected_amount',
        'paid_amount',
        'service_date_from',
        'service_date_to',
        'submission_date',
        'approval_date',
        'payment_date',
        'authorization_number',
        'rejection_reason',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'claimed_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'rejected_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'service_date_from' => 'date',
        'service_date_to' => 'date',
        'submission_date' => 'date',
        'approval_date' => 'date',
        'payment_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($claim) {
            if (empty($claim->claim_number)) {
                $claim->claim_number = 'CLM'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
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

    public function employerScheme(): BelongsTo
    {
        return $this->belongsTo(EmployerScheme::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ClaimItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ClaimStatusHistory::class);
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

    public function scopeByInsurer($query, int $insurerId)
    {
        return $query->where('insurer_id', $insurerId);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'submitted', 'pending']);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function getOutstandingAmountAttribute(): float
    {
        return max(0, $this->approved_amount - $this->paid_amount);
    }

    public function isFullyPaid(): bool
    {
        return $this->paid_amount >= $this->approved_amount;
    }

    public function canBeResubmitted(): bool
    {
        return in_array($this->status, ['rejected', 'resubmitted']);
    }

    public function updateStatus(string $newStatus, ?string $notes = null, ?int $userId = null): void
    {
        $oldStatus = $this->status;
        $this->status = $newStatus;
        $this->save();

        ClaimStatusHistory::create([
            'insurance_claim_id' => $this->id,
            'from_status' => $oldStatus,
            'to_status' => $newStatus,
            'notes' => $notes,
            'changed_by' => $userId,
        ]);
    }
}
