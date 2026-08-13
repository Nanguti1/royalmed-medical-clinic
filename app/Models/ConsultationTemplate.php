<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsultationTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'specialty', 'chief_complaint', 'history', 'examination', 'plan', 'notes', 'is_active', 'created_by'];
    protected $casts = ['is_active' => 'boolean'];

    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
