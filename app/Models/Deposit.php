<?php

namespace App\Models;

use Database\Factories\DepositFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deposit extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DepositFactory::class;

    protected $fillable = [
        'deposit_number',
        'patient_id',
        'payment_id',
        'amount',
        'used_amount',
        'remaining_amount',
        'status',
        'deposit_date',
        'expiry_date',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'used_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'deposit_date' => 'date',
        'expiry_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($deposit) {
            if (empty($deposit->deposit_number)) {
                $deposit->deposit_number = 'DEP'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(DepositAllocation::class);
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
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'active')
            ->where('expiry_date', '<', now());
    }

    public function isCurrentlyValid(): bool
    {
        return $this->status === 'active' &&
            ($this->expiry_date === null || $this->expiry_date >= now());
    }

    public function isExpired(): bool
    {
        return $this->status === 'active' && $this->expiry_date && $this->expiry_date < now();
    }

    public function isExhausted(): bool
    {
        return $this->remaining_amount <= 0;
    }

    public function hasAvailableFunds(float $amount): bool
    {
        return $this->isCurrentlyValid() && $this->remaining_amount >= $amount;
    }

    public function useAmount(float $amount): void
    {
        if (! $this->hasAvailableFunds($amount)) {
            throw new \RuntimeException('Insufficient deposit funds');
        }

        $this->used_amount += $amount;
        $this->remaining_amount = max(0, $this->amount - $this->used_amount);

        if ($this->remaining_amount <= 0) {
            $this->status = 'exhausted';
        }

        $this->save();
    }

    public function refund(): void
    {
        if ($this->status === 'refunded') {
            throw new \RuntimeException('Deposit already refunded');
        }

        $this->status = 'refunded';
        $this->save();
    }

    public function expire(): void
    {
        if ($this->status !== 'active') {
            throw new \RuntimeException('Only active deposits can be expired');
        }

        $this->status = 'expired';
        $this->save();
    }
}
