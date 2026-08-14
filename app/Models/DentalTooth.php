<?php

namespace App\Models;

use Database\Factories\DentalToothFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DentalTooth extends Model
{
    use HasFactory;

    protected static $factory = DentalToothFactory::class;

    protected $fillable = [
        'dental_chart_id',
        'tooth_number',
        'tooth_name',
        'conditions',
        'restorations',
        'mobility',
        'is_extracted',
        'extraction_date',
        'notes',
    ];

    protected $casts = [
        'conditions' => 'array',
        'restorations' => 'array',
        'mobility' => 'array',
        'is_extracted' => 'boolean',
        'extraction_date' => 'date',
    ];

    public function dentalChart(): BelongsTo
    {
        return $this->belongsTo(DentalChart::class);
    }

    public function scopeByToothNumber($query, string $toothNumber)
    {
        return $query->where('tooth_number', $toothNumber);
    }

    public function scopeExtracted($query)
    {
        return $query->where('is_extracted', true);
    }

    public function scopeWithCondition($query, string $condition)
    {
        return $query->whereJsonContains('conditions', $condition);
    }

    public function hasCondition(string $condition): bool
    {
        return in_array($condition, $this->conditions ?? []);
    }

    public function addCondition(string $condition): void
    {
        $conditions = $this->conditions ?? [];
        if (! in_array($condition, $conditions)) {
            $conditions[] = $condition;
            $this->conditions = $conditions;
            $this->save();
        }
    }

    public function extract(): void
    {
        $this->is_extracted = true;
        $this->extraction_date = now();
        $this->save();
    }
}
