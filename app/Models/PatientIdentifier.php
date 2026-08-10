<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientIdentifier extends Model
{
    use HasFactory;

    protected $fillable = ['patient_id', 'identifier_type', 'identifier_value', 'is_primary'];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
