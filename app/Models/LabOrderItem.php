<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabOrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['lab_order_id', 'lab_test_id', 'status', 'sample_type', 'sample_collected_at', 'sample_collected_by', 'sample_status'];

    protected $casts = [
        'sample_collected_at' => 'datetime',
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

    public function isSampleCollected(): bool
    {
        return $this->sample_collected_at !== null;
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
        return $this->sample_status === 'pending' && ! $this->isSampleCollected();
    }

    public function canReceiveSample(): bool
    {
        return $this->isSampleCollected() && $this->sample_status === 'collected';
    }

    public function canProcessSample(): bool
    {
        return $this->sample_status === 'received';
    }
}
