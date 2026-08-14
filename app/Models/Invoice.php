<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'issued_at', 'invoice_number', 'created_by', 'discount_amount', 'tax_amount', 'discount_id', 'patient_coverage_id', 'insurance_claim_id', 'is_insurance_claim', 'notes'];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'issued_at' => 'datetime',
        'is_insurance_claim' => 'boolean',
    ];

    protected static $serverUpdateMode = false;

    protected static function booted()
    {
        static::updating(function ($invoice) {
            // Skip protection when in server update mode
            if (self::$serverUpdateMode) {
                return;
            }

            // Protect immutable financial fields after initial creation
            $protectedFields = ['invoice_number', 'total_amount'];

            foreach ($protectedFields as $field) {
                if ($invoice->isDirty($field)) {
                    throw new \RuntimeException("Invoice field '{$field}' cannot be modified after invoice creation. Financial records are immutable.");
                }
            }
        });
    }

    /**
     * Execute a callback with server update mode enabled.
     * This allows legitimate server-side operations to update protected fields.
     */
    public static function withServerUpdate(callable $callback)
    {
        $previousMode = self::$serverUpdateMode;
        self::$serverUpdateMode = true;

        try {
            return $callback();
        } finally {
            self::$serverUpdateMode = $previousMode;
        }
    }

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function status()
    {
        return $this->belongsTo(InvoiceStatus::class, 'status_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }

    public function patientCoverage()
    {
        return $this->belongsTo(PatientCoverage::class);
    }

    public function insuranceClaim()
    {
        return $this->belongsTo(InsuranceClaim::class);
    }

    public function getOutstandingBalanceAttribute(): float
    {
        $paid = $this->payments()->sum('amount');

        return max(0, $this->total_amount - $paid);
    }

    public function isPaid(): bool
    {
        return $this->outstanding_balance <= 0;
    }

    public function isCancelled(): bool
    {
        return $this->status && $this->status->code === 'cancelled';
    }

    public function canHaveInsuranceClaim(): bool
    {
        return $this->patientCoverage !== null && ! $this->isCancelled();
    }

    public function createInsuranceClaim(array $data): InsuranceClaim
    {
        if (! $this->canHaveInsuranceClaim()) {
            throw new \RuntimeException('Invoice cannot have insurance claim');
        }

        $claim = InsuranceClaim::create([
            'claim_number' => $data['claim_number'] ?? null,
            'patient_id' => $this->visit->patient_id,
            'insurer_id' => $this->patientCoverage->insurer_id,
            'insurance_scheme_id' => $this->patientCoverage->insurance_scheme_id,
            'patient_coverage_id' => $this->patientCoverage->id,
            'invoice_id' => $this->id,
            'status' => 'draft',
            'claimed_amount' => $this->total_amount - $this->discount_amount,
            'service_date_from' => $this->visit->visit_date,
            'service_date_to' => $this->visit->visit_date,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);

        $this->insurance_claim_id = $claim->id;
        $this->is_insurance_claim = true;
        $this->save();

        return $claim;
    }

    public function createPaymentPlan(array $data): PaymentPlan
    {
        if ($this->isCancelled()) {
            throw new \RuntimeException('Cannot create payment plan for cancelled invoice');
        }

        $plan = PaymentPlan::create([
            'invoice_id' => $this->id,
            'patient_id' => $this->visit->patient_id,
            'status' => 'active',
            'total_amount' => $this->outstanding_balance,
            'paid_amount' => 0,
            'remaining_amount' => $this->outstanding_balance,
            'installment_count' => $data['installment_count'] ?? 1,
            'completed_installments' => 0,
            'frequency' => $data['frequency'] ?? 'monthly',
            'start_date' => $data['start_date'] ?? now(),
            'next_payment_date' => $data['start_date'] ?? now(),
            'installment_amount' => $this->outstanding_balance / ($data['installment_count'] ?? 1),
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);

        return $plan;
    }
}
