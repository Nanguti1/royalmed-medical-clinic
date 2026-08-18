<?php

namespace App\Models;

use Database\Factories\DentalTreatmentPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalTreatmentPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DentalTreatmentPlanFactory::class;

    protected $fillable = [
        'plan_number',
        'patient_id',
        'dentist_id',
        'dental_chart_id',
        'plan_date',
        'status',
        'priority',
        'estimated_cost',
        'actual_cost',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'plan_date' => 'date',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'priority' => 'string',
    ];

    protected static function booted()
    {
        static::creating(function ($plan) {
            if (empty($plan->plan_number)) {
                $plan->plan_number = 'DTP'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function dentalChart(): BelongsTo
    {
        return $this->belongsTo(DentalChart::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function treatmentItems(): HasMany
    {
        return $this->hasMany(DentalTreatmentItem::class, 'treatment_plan_id');
    }

    public function dentalNotes(): HasMany
    {
        return $this->hasMany(DentalNote::class, 'treatment_plan_id');
    }

    public function notes(): HasMany
    {
        return $this->dentalNotes();
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->actual_cost = $this->treatmentItems()->where('status', 'completed')->sum('cost');
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function updateEstimatedCost(): void
    {
        $this->estimated_cost = $this->treatmentItems()->sum('cost');
        $this->save();
    }
}
