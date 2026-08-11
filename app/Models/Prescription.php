<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'prescribed_by', 'notes'];

    protected $casts = [
        'finalized_at' => 'datetime',
        'dispensed_at' => 'datetime',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function isDraft(): bool
    {
        return is_null($this->finalized_at);
    }

    public function isFinalized(): bool
    {
        return ! is_null($this->finalized_at);
    }

    public function isDispensed(): bool
    {
        return ! is_null($this->dispensed_at);
    }

    public function isFullyDispensed(): bool
    {
        if ($this->items->isEmpty()) {
            return false;
        }

        foreach ($this->items as $item) {
            if (($item->dispensed_quantity ?? 0) < $item->quantity) {
                return false;
            }
        }

        return true;
    }

    public function isPartiallyDispensed(): bool
    {
        if ($this->items->isEmpty()) {
            return false;
        }

        $hasDispensed = false;
        $hasRemaining = false;

        foreach ($this->items as $item) {
            if (($item->dispensed_quantity ?? 0) > 0) {
                $hasDispensed = true;
            }
            if (($item->dispensed_quantity ?? 0) < $item->quantity) {
                $hasRemaining = true;
            }
        }

        return $hasDispensed && $hasRemaining;
    }

    public function canAddItem(): bool
    {
        return $this->isDraft();
    }

    public function canFinalize(): bool
    {
        return $this->isDraft() && $this->items->isNotEmpty();
    }

    public function canDispense(): bool
    {
        return $this->isFinalized() && ! $this->isDispensed();
    }
}
