<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'invoice_number', 'status_id', 'total_amount', 'due_amount', 'issued_at'];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'issued_at' => 'datetime',
    ];

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
