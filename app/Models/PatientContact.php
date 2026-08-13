<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientContact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'type', 'value', 'label', 'is_primary', 'consent_to_contact'];

    protected $casts = ['is_primary' => 'boolean', 'consent_to_contact' => 'boolean'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
