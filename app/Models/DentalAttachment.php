<?php

namespace App\Models;

use Database\Factories\DentalAttachmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DentalAttachmentFactory::class;

    protected $fillable = [
        'patient_id',
        'dental_chart_id',
        'dental_note_id',
        'attachment_type',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'mime_type',
        'description',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentalChart(): BelongsTo
    {
        return $this->belongsTo(DentalChart::class);
    }

    public function dentalNote(): BelongsTo
    {
        return $this->belongsTo(DentalNote::class);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('attachment_type', $type);
    }

    public function scopeXray($query)
    {
        return $query->where('attachment_type', 'xray');
    }

    public function scopePhotoBefore($query)
    {
        return $query->where('attachment_type', 'photo_before');
    }

    public function scopePhotoAfter($query)
    {
        return $query->where('attachment_type', 'photo_after');
    }

    public function scopeScan($query)
    {
        return $query->where('attachment_type', 'scan');
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }
}
