<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientChronicCondition extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'condition_name', 'code', 'coding_system', 'diagnosed_on', 'is_active', 'notes', 'recorded_by'];
    protected $casts = ['diagnosed_on' => 'date', 'is_active' => 'boolean'];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function recordedBy(): BelongsTo { return $this->belongsTo(User::class, 'recorded_by'); }
}
