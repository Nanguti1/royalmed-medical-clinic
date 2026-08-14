<?php

namespace App\Models;

use Database\Factories\DepositAllocationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositAllocation extends Model
{
    use HasFactory;

    protected static $factory = DepositAllocationFactory::class;

    protected $fillable = [
        'deposit_id',
        'payment_id',
        'invoice_id',
        'amount',
        'allocated_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'allocated_at' => 'datetime',
    ];

    public function deposit(): BelongsTo
    {
        return $this->belongsTo(Deposit::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
