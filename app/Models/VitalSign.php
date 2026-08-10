<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VitalSign extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'temperature_c', 'blood_pressure', 'pulse', 'respiratory_rate', 'weight_kg', 'height_cm'];

    protected $casts = [
        'temperature_c' => 'decimal:1',
        'weight_kg' => 'decimal:2',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }
}
