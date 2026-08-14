<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DocumentFactory::class;

    protected $fillable = [
        'document_number',
        'patient_id',
        'visit_id',
        'consultation_id',
        'lab_result_id',
        'uploaded_by',
        'title',
        'category',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'mime_type',
        'description',
        'is_sensitive',
        'is_confidential',
        'uploaded_at',
        'expires_at',
        'storage_location',
        'metadata',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_sensitive' => 'boolean',
        'is_confidential' => 'boolean',
        'uploaded_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($document) {
            if (empty($document->document_number)) {
                $document->document_number = 'DOC'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function labResult(): BelongsTo
    {
        return $this->belongsTo(LabResult::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(DocumentAccessLog::class);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSensitive($query)
    {
        return $query->where('is_sensitive', true);
    }

    public function scopeConfidential($query)
    {
        return $query->where('is_confidential', true);
    }

    public function scopeForPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }

    public function isAccessible(): bool
    {
        return ! $this->isExpired();
    }

    public function getFileUrlAttribute(): string
    {
        return Storage::disk($this->storage_location)->url($this->file_path);
    }

    public function logAccess(int $userId, string $action, ?string $reason = null, ?string $ipAddress = null, ?string $userAgent = null): void
    {
        $this->accessLogs()->create([
            'user_id' => $userId,
            'action' => $action,
            'access_reason' => $reason,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    public function createVersion(array $data): DocumentVersion
    {
        $latestVersion = $this->versions()->max('version_number') ?? 0;

        return $this->versions()->create([
            'version_number' => $latestVersion + 1,
            'file_path' => $data['file_path'],
            'file_name' => $data['file_name'],
            'file_type' => $data['file_type'],
            'file_size' => $data['file_size'],
            'mime_type' => $data['mime_type'],
            'uploaded_by' => $data['uploaded_by'] ?? auth()->id(),
            'change_notes' => $data['change_notes'] ?? null,
        ]);
    }
}
