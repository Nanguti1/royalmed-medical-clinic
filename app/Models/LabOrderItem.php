<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_order_id',
        'lab_test_id',
        'status',
        'sample_type',
        'sample_collected_at',
        'sample_collected_by',
        'sample_status',
        'accession_number',
        'specimen_label',
        'received_at',
        'received_by',
        'processing_at',
        'processed_by',
        'completed_at',
        'completed_by',
    ];

    protected $casts = [
        'sample_collected_at' => 'datetime',
        'received_at' => 'datetime',
        'processing_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(LabOrder::class, 'lab_order_id');
    }

    public function test()
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }

    public function result()
    {
        return $this->hasOne(LabResult::class, 'lab_order_item_id');
    }

    public function sampleCollectedBy()
    {
        return $this->belongsTo(User::class, 'sample_collected_by');
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function isSampleCollected(): bool
    {
        return $this->sample_collected_at !== null || $this->sample_status === 'collected';
    }

    public function isSampleReceived(): bool
    {
        return in_array($this->sample_status, ['received', 'processing', 'completed']);
    }

    public function isSampleProcessing(): bool
    {
        return $this->sample_status === 'processing';
    }

    public function isSampleCompleted(): bool
    {
        return $this->sample_status === 'completed';
    }

    public function canCollectSample(): bool
    {
        return in_array($this->sample_status, ['pending', 'ordered', null]) && ! $this->isSampleCollected();
    }

    public function canReceiveSample(): bool
    {
        return $this->sample_status === 'collected';
    }

    public function canProcessSample(): bool
    {
        return $this->sample_status === 'received';
    }

    public function canCompleteSample(): bool
    {
        return $this->sample_status === 'processing';
    }
}
