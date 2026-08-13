<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientAlert extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'type', 'title', 'message', 'severity', 'is_active', 'starts_at', 'ends_at', 'created_by'];
    protected $casts = ['is_active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime'];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
