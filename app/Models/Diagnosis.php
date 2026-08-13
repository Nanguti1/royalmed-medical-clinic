<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagnosis extends Model
{
    use HasFactory;

    protected $fillable = ['consultation_id', 'code', 'coding_system', 'description', 'diagnosis_type', 'certainty', 'rank', 'is_primary'];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
