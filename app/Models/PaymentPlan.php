<?php

namespace App\Models;

use Database\Factories\PaymentPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = PaymentPlanFactory::class;

    protected $fillable = [
        'invoice_id',
        'patient_id',
        'status',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'installment_count',
        'completed_installments',
        'frequency',
        'start_date',
        'end_date',
        'next_payment_date',
        'installment_amount',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'installment_count' => 'integer',
        'completed_installments' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_payment_date' => 'date',
        'installment_amount' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(PaymentPlanInstallment::class);
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

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'active')
            ->where('next_payment_date', '<', now());
    }

    public function isFullyPaid(): bool
    {
        return $this->paid_amount >= $this->total_amount;
    }

    public function isOverdue(): bool
    {
        return $this->status === 'active' && $this->next_payment_date && $this->next_payment_date < now();
    }

    public function makePayment(float $amount, ?int $paymentId = null): void
    {
        $this->paid_amount += $amount;
        $this->remaining_amount = max(0, $this->total_amount - $this->paid_amount);

        if ($this->paid_amount >= $this->total_amount) {
            $this->status = 'completed';
            $this->end_date = now();
        }

        $this->save();
    }

    public function cancel(): void
    {
        if ($this->status === 'completed') {
            throw new \RuntimeException('Cannot cancel a completed payment plan');
        }

        $this->status = 'cancelled';
        $this->save();
    }

    public function markAsDefaulted(): void
    {
        if ($this->status !== 'active') {
            throw new \RuntimeException('Only active payment plans can be marked as defaulted');
        }

        $this->status = 'defaulted';
        $this->save();
    }
}
