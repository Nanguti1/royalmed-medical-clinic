<?php

namespace App\Models;

use Database\Factories\CreditNoteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditNote extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = CreditNoteFactory::class;

    protected $fillable = [
        'credit_note_number',
        'invoice_id',
        'payment_id',
        'reason',
        'amount',
        'tax_amount',
        'total_amount',
        'description',
        'status',
        'issued_date',
        'applied_date',
        'issued_by',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'issued_date' => 'date',
        'applied_date' => 'date',
        'approved_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($creditNote) {
            if (empty($creditNote->credit_note_number)) {
                $creditNote->credit_note_number = 'CN'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopeApplied($query)
    {
        return $query->where('status', 'applied');
    }

    public function isApplied(): bool
    {
        return $this->status === 'applied';
    }

    public function canBeApplied(): bool
    {
        return $this->status === 'issued' && $this->approved_at !== null;
    }

    public function apply(): void
    {
        if (! $this->canBeApplied()) {
            throw new \RuntimeException('Credit note cannot be applied');
        }

        $this->status = 'applied';
        $this->applied_date = now();
        $this->save();
    }

    public function void(): void
    {
        if ($this->status === 'applied') {
            throw new \RuntimeException('Cannot void an applied credit note');
        }

        $this->status = 'voided';
        $this->save();
    }
}
