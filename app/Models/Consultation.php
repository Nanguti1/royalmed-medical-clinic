<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id', 'provider_id', 'chief_complaint',
        'history', 'examination', 'plan', 'notes',
        'subjective', 'objective', 'assessment',
        'follow_up_date', 'follow_up_notes', 'follow_up_type',
    ];

    protected $casts = [
        'follow_up_date' => 'date',
    ];

    protected $appends = ['labOrders'];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function primaryDiagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class)->where('diagnosis_type', 'primary')->orderBy('rank');
    }

    public function differentialDiagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class)->where('diagnosis_type', 'differential')->orderBy('rank');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ClinicalAttachment::class);
    }

    public function labOrders(): HasMany
    {
        return $this->hasMany(LabOrder::class);
    }

    public function getLabOrdersAttribute()
    {
        return $this->getRelationValue('labOrders');
    }

    public function getSubjectiveAttribute(): ?string
    {
        return $this->attributes['subjective'] ?? $this->attributes['history'] ?? null;
    }

    public function getObjectiveAttribute(): ?string
    {
        return $this->attributes['objective'] ?? $this->attributes['examination'] ?? null;
    }

    public function getAssessmentAttribute(): ?string
    {
        return $this->attributes['assessment'] ?? $this->attributes['notes'] ?? null;
    }

    public function setSubjectiveAttribute(?string $value): void
    {
        $this->attributes['subjective'] = $value;
        $this->attributes['history'] = $value;
    }

    public function setObjectiveAttribute(?string $value): void
    {
        $this->attributes['objective'] = $value;
        $this->attributes['examination'] = $value;
    }

    public function setAssessmentAttribute(?string $value): void
    {
        $this->attributes['assessment'] = $value;
        $this->attributes['notes'] = $value;
    }

    public function setHistoryAttribute(?string $value): void
    {
        $this->attributes['history'] = $value;
        if (empty($this->attributes['subjective'])) {
            $this->attributes['subjective'] = $value;
        }
    }

    public function setExaminationAttribute(?string $value): void
    {
        $this->attributes['examination'] = $value;
        if (empty($this->attributes['objective'])) {
            $this->attributes['objective'] = $value;
        }
    }

    public function setNotesAttribute(?string $value): void
    {
        $this->attributes['notes'] = $value;
        if (empty($this->attributes['assessment'])) {
            $this->attributes['assessment'] = $value;
        }
    }
}
