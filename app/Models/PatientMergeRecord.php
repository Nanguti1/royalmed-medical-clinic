<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientMergeRecord extends Model
{
    use HasFactory;

    protected $fillable = ['source_patient_id', 'target_patient_id', 'merged_patient_snapshot', 'reason', 'merged_by', 'merged_at'];
    protected $casts = ['merged_patient_snapshot' => 'array', 'merged_at' => 'datetime'];

    public function sourcePatient(): BelongsTo { return $this->belongsTo(Patient::class, 'source_patient_id'); }
    public function targetPatient(): BelongsTo { return $this->belongsTo(Patient::class, 'target_patient_id'); }
    public function mergedBy(): BelongsTo { return $this->belongsTo(User::class, 'merged_by'); }
}
