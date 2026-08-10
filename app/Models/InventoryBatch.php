<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryBatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['medicine_id', 'batch_number', 'expiry_date', 'quantity', 'purchase_price', 'supplier_id', 'received_at'];

    protected $casts = [
        'expiry_date' => 'date',
        'quantity' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'received_at' => 'datetime',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function hasStock(float $quantity): bool
    {
        return $this->quantity >= $quantity;
    }

    public function isDepleted(): bool
    {
        return $this->quantity <= 0;
    }
}
