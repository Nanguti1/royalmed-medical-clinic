<?php

namespace App\Models;

use Database\Factories\PaymentPlanInstallmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentPlanInstallment extends Model
{
    use HasFactory;

    protected static $factory = PaymentPlanInstallmentFactory::class;

    protected $fillable = [
        'payment_plan_id',
        'installment_number',
        'amount',
        'paid_amount',
        'due_date',
        'paid_date',
        'status',
        'payment_id',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    public function paymentPlan(): BelongsTo
    {
        return $this->belongsTo(PaymentPlan::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where('due_date', '<', now());
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'pending' && $this->due_date < now();
    }

    public function markAsPaid(?int $paymentId = null): void
    {
        $this->status = 'paid';
        $this->paid_date = now();
        $this->paid_amount = $this->amount;
        $this->payment_id = $paymentId;
        $this->save();
    }

    public function waive(): void
    {
        if ($this->status === 'paid') {
            throw new \RuntimeException('Cannot waive a paid installment');
        }

        $this->status = 'waived';
        $this->save();
    }
}
