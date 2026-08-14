<?php

namespace App\Models;

use Database\Factories\ClaimItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimItem extends Model
{
    use HasFactory;

    protected static $factory = ClaimItemFactory::class;

    protected $fillable = [
        'insurance_claim_id',
        'invoice_item_id',
        'service_code',
        'service_name',
        'description',
        'quantity',
        'unit_price',
        'claimed_amount',
        'approved_amount',
        'rejected_amount',
        'rejection_reason',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'claimed_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'rejected_amount' => 'decimal:2',
    ];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(InsuranceClaim::class, 'insurance_claim_id');
    }

    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    public function getOutstandingAmountAttribute(): float
    {
        return max(0, $this->claimed_amount - $this->approved_amount - $this->rejected_amount);
    }

    public function isFullyApproved(): bool
    {
        return $this->approved_amount >= $this->claimed_amount;
    }

    public function isFullyRejected(): bool
    {
        return $this->rejected_amount >= $this->claimed_amount;
    }
}
