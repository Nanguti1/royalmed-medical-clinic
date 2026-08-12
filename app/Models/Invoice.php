<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'issued_at', 'invoice_number', 'created_by'];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'issued_at' => 'datetime',
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
}
