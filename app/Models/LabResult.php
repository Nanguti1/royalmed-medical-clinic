<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabResult extends Model
{
    use HasFactory;

    protected $fillable = ['lab_test_id', 'lab_order_item_id', 'result_value', 'units', 'reference_range', 'notes', 'recorded_by', 'recorded_at', 'is_abnormal', 'is_critical', 'verified_by', 'verified_at', 'verification_status', 'rejection_reason'];

    protected $casts = [
        'recorded_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_abnormal' => 'boolean',
        'is_critical' => 'boolean',
    ];

    public function test()
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(LabOrderItem::class, 'lab_order_item_id');
    }

    public function labOrder()
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'rejected';
    }

    public function isPendingVerification(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function canVerify(): bool
    {
        return $this->isPendingVerification();
    }

    public function markAsVerified($userId): void
    {
        $this->verification_status = 'verified';
        $this->verified_by = $userId;
        $this->verified_at = now();
        $this->save();
    }

    public function markAsRejected($userId, ?string $reason = null): void
    {
        $this->verification_status = 'rejected';
        $this->verified_by = $userId;
        $this->verified_at = now();
        $this->rejection_reason = $reason;
        $this->save();
    }

    public function autoDetectAbnormal($patient): void
    {
        if ($this->test && $this->orderItem?->order?->visit?->patient) {
            $this->is_abnormal = $this->test->isResultAbnormal($this->result_value, $this->orderItem->order->visit->patient);
        }
    }

    public function autoDetectCritical(): void
    {
        if ($this->test) {
            $this->is_critical = (bool) ($this->is_critical || ($this->test->is_critical && $this->is_abnormal));
        }
    }
}
