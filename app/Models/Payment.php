<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['invoice_id', 'payment_method_id', 'amount', 'paid_at', 'reference', 'mpesa_transaction_id', 'received_by', 'receipt_number'];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    protected static $serverUpdateMode = false;

    protected static function booted()
    {
        static::updating(function ($payment) {
            // Skip protection when in server update mode
            if (self::$serverUpdateMode) {
                return;
            }

            // Protect immutable financial fields - these can never be modified after creation
            $protectedFields = ['invoice_id', 'payment_method_id', 'amount', 'paid_at', 'received_by', 'receipt_number'];

            foreach ($protectedFields as $field) {
                if ($payment->isDirty($field)) {
                    throw new \RuntimeException("Payment field '{$field}' cannot be modified after payment creation. Financial records are immutable.");
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

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function method(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function mpesaTransaction(): BelongsTo
    {
        return $this->belongsTo(MpesaTransaction::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
