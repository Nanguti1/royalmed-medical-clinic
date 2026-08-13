<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VitalSign extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'temperature_c', 'blood_pressure', 'pulse', 'respiratory_rate', 'oxygen_saturation', 'weight_kg', 'height_cm', 'bmi', 'pain_score', 'news_score', 'chief_complaint', 'nurse_notes'];

    protected $casts = [
        'temperature_c' => 'decimal:1',
        'oxygen_saturation' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'bmi' => 'decimal:2',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }
}
