<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabOrder extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'ordered_by', 'order_date', 'status', 'notes', 'in_progress_at', 'completed_at'];

    protected $casts = [
        'order_date' => 'datetime',
        'in_progress_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function items()
    {
        return $this->hasMany(LabOrderItem::class);
    }

    public function results()
    {
        return $this->hasManyThrough(LabResult::class, LabOrderItem::class);
    }

    public function isOrdered(): bool
    {
        return $this->status === 'ordered';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canAddTest(): bool
    {
        return $this->isOrdered();
    }

    public function canStart(): bool
    {
        return $this->isOrdered() && $this->items->isNotEmpty();
    }

    public function canComplete(): bool
    {
        return $this->isInProgress();
    }

    public function canRecordResult(): bool
    {
        return $this->isInProgress() || $this->isOrdered();
    }
}
