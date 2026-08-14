<?php

namespace App\Models;

use Database\Factories\RefundFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Refund extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = RefundFactory::class;

    protected $fillable = [
        'refund_number',
        'payment_id',
        'credit_note_id',
        'reason',
        'amount',
        'status',
        'requested_date',
        'approved_date',
        'processed_date',
        'refund_method',
        'bank_name',
        'bank_account',
        'rejection_reason',
        'requested_by',
        'approved_by',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'requested_date' => 'date',
        'approved_date' => 'date',
        'processed_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($refund) {
            if (empty($refund->refund_number)) {
                $refund->refund_number = 'REF'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    public function canBeProcessed(): bool
    {
        return $this->status === 'approved';
    }

    public function approve(?int $userId = null): void
    {
        if (! $this->canBeApproved()) {
            throw new \RuntimeException('Refund cannot be approved');
        }

        $this->status = 'approved';
        $this->approved_date = now();
        $this->approved_by = $userId;
        $this->save();
    }

    public function process(?int $userId = null): void
    {
        if (! $this->canBeProcessed()) {
            throw new \RuntimeException('Refund cannot be processed');
        }

        $this->status = 'processed';
        $this->processed_date = now();
        $this->processed_by = $userId;
        $this->save();
    }

    public function reject(string $reason, ?int $userId = null): void
    {
        if (! $this->canBeApproved()) {
            throw new \RuntimeException('Refund cannot be rejected');
        }

        $this->status = 'rejected';
        $this->rejection_reason = $reason;
        $this->approved_by = $userId;
        $this->approved_date = now();
        $this->save();
    }
}
