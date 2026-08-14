<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabOrder extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'ordered_by', 'order_date', 'status', 'notes', 'accession_number', 'in_progress_at', 'completed_at', 'priority', 'sample_collected_at', 'sample_collected_by'];

    protected $casts = [
        'order_date' => 'datetime',
        'in_progress_at' => 'datetime',
        'completed_at' => 'datetime',
        'sample_collected_at' => 'datetime',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function sampleCollectedBy()
    {
        return $this->belongsTo(User::class, 'sample_collected_by');
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

    public function isPriority(): bool
    {
        return in_array($this->priority, ['urgent', 'stat']);
    }

    public function isStat(): bool
    {
        return $this->priority === 'stat';
    }

    public function isUrgent(): bool
    {
        return $this->priority === 'urgent';
    }

    public function isSampleCollected(): bool
    {
        return $this->sample_collected_at !== null;
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
        return $this->isInProgress();
    }

    public function canCollectSample(): bool
    {
        return $this->isOrdered() && ! $this->isSampleCollected();
    }
}
