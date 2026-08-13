<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientAllergy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'allergen', 'allergen_type', 'reaction', 'severity', 'is_active', 'recorded_by', 'recorded_at'];
    protected $casts = ['is_active' => 'boolean', 'recorded_at' => 'datetime'];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function recordedBy(): BelongsTo { return $this->belongsTo(User::class, 'recorded_by'); }
}
