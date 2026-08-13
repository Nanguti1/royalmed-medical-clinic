<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name', 'description', 'standard_units', 'price', 'lab_category_id', 'sample_type', 'sample_requirements', 'is_critical', 'turnaround_time_hours'];

    protected $casts = [
        'price' => 'decimal:2',
        'is_critical' => 'boolean',
        'turnaround_time_hours' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(LabCategory::class, 'lab_category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(LabOrderItem::class);
    }

    public function results()
    {
        return $this->hasMany(LabResult::class);
    }

    public function referenceRanges()
    {
        return $this->hasMany(LabTestReferenceRange::class);
    }

    public function getReferenceRangeForPatient($patient): ?LabTestReferenceRange
    {
        return $this->referenceRanges()
            ->where(function ($query) use ($patient) {
                $query->whereNull('age_group')
                    ->orWhere('age_group', $this->getPatientAgeGroup($patient));
            })
            ->where(function ($query) use ($patient) {
                $query->whereNull('sex')
                    ->orWhere('sex', strtolower($patient->sex ?? ''));
            })
            ->first();
    }

    public function isResultAbnormal($resultValue, $patient): bool
    {
        $referenceRange = $this->getReferenceRangeForPatient($patient);
        if (! $referenceRange || ! is_numeric($resultValue)) {
            return false;
        }

        $value = floatval($resultValue);

        if ($referenceRange->min_value !== null) {
            $minOp = $referenceRange->min_operator ?? '>=';
            if ($minOp === '>' && $value <= $referenceRange->min_value) {
                return true;
            }
            if ($minOp === '>=' && $value < $referenceRange->min_value) {
                return true;
            }
        }

        if ($referenceRange->max_value !== null) {
            $maxOp = $referenceRange->max_operator ?? '<=';
            if ($maxOp === '<' && $value >= $referenceRange->max_value) {
                return true;
            }
            if ($maxOp === '<=' && $value > $referenceRange->max_value) {
                return true;
            }
        }

        return false;
    }

    protected function getPatientAgeGroup($patient): string
    {
        if (! $patient || ! $patient->date_of_birth) {
            return 'adult';
        }

        $age = $patient->date_of_birth->age;

        if ($age < 1) {
            return 'neonate';
        }
        if ($age < 12) {
            return 'child';
        }
        if ($age < 18) {
            return 'adolescent';
        }

        return 'adult';
    }
}
