<?php

namespace App\Models;

use Database\Factories\DentalTreatmentItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DentalTreatmentItem extends Model
{
    use HasFactory;

    protected static $factory = DentalTreatmentItemFactory::class;

    protected $fillable = [
        'treatment_plan_id',
        'dental_procedure_id',
        'tooth_number',
        'tooth_surface',
        'description',
        'cost',
        'status',
        'scheduled_date',
        'completed_date',
        'notes',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'scheduled_date' => 'date',
        'completed_date' => 'date',
    ];

    public function treatmentPlan(): BelongsTo
    {
        return $this->belongsTo(DentalTreatmentPlan::class);
    }

    public function dentalProcedure(): BelongsTo
    {
        return $this->belongsTo(DentalProcedure::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByTooth($query, string $toothNumber)
    {
        return $query->where('tooth_number', $toothNumber);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function start(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->completed_date = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
