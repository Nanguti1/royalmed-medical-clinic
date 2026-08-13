<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientRelationship extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'related_patient_id', 'relationship', 'name', 'phone', 'is_next_of_kin', 'is_emergency_contact'];
    protected $casts = ['is_next_of_kin' => 'boolean', 'is_emergency_contact' => 'boolean'];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function relatedPatient(): BelongsTo { return $this->belongsTo(Patient::class, 'related_patient_id'); }
}
