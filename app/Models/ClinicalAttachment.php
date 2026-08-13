<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicalAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['patient_id', 'visit_id', 'consultation_id', 'title', 'file_path', 'mime_type', 'file_size', 'attachment_type', 'uploaded_by'];

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function visit(): BelongsTo { return $this->belongsTo(Visit::class); }
    public function consultation(): BelongsTo { return $this->belongsTo(Consultation::class); }
    public function uploadedBy(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }
}
