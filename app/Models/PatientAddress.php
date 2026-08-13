<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientAddress extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'type', 'address_line', 'county_id', 'sub_county_id', 'town', 'is_primary'];

    protected $casts = ['is_primary' => 'boolean'];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function county(): BelongsTo { return $this->belongsTo(County::class); }
    public function subCounty(): BelongsTo { return $this->belongsTo(SubCounty::class, 'sub_county_id'); }
}
