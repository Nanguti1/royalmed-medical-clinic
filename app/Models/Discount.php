<?php

namespace App\Models;

use Database\Factories\DiscountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discount extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DiscountFactory::class;

    protected $fillable = [
        'code',
        'name',
        'type',
        'value',
        'max_discount_amount',
        'is_active',
        'valid_from',
        'valid_to',
        'applicable_to',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', now());
            });
    }

    public function isCurrentlyValid(): bool
    {
        $fromValid = $this->valid_from === null || $this->valid_from <= now();
        $toValid = $this->valid_to === null || $this->valid_to >= now();

        return $this->is_active && $fromValid && $toValid;
    }

    public function calculateDiscount(float $amount): float
    {
        $discount = $this->type === 'percentage'
            ? $amount * ($this->value / 100)
            : $this->value;

        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            return $this->max_discount_amount;
        }

        return min($discount, $amount);
    }
}
