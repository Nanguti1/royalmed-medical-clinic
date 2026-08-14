<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsultationTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'specialty', 'chief_complaint',
        'history', 'examination', 'plan', 'notes',
        'subjective', 'objective', 'assessment',
        'is_active', 'created_by',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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
}
