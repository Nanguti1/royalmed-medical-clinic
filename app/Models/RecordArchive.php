<?php

namespace App\Models;

use Database\Factories\RecordArchiveFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecordArchive extends Model
{
    use HasFactory;

    protected static $factory = RecordArchiveFactory::class;

    protected $fillable = [
        'archive_number',
        'record_type',
        'record_id',
        'retention_schedule_id',
        'archive_status',
        'archived_at',
        'restore_eligible_at',
        'purge_eligible_at',
        'restored_at',
        'purged_at',
        'archive_reason',
        'archived_by',
        'restored_by',
        'purged_by',
        'metadata',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
        'restore_eligible_at' => 'datetime',
        'purge_eligible_at' => 'datetime',
        'restored_at' => 'datetime',
        'purged_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($archive) {
            if (empty($archive->archive_number)) {
                $archive->archive_number = 'ARC'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function retentionSchedule(): BelongsTo
    {
        return $this->belongsTo(RetentionSchedule::class);
    }

    public function archivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function restoredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'restored_by');
    }

    public function purgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purged_by');
    }

    public function scopeArchived($query)
    {
        return $query->where('archive_status', 'archived');
    }

    public function scopeRestored($query)
    {
        return $query->where('archive_status', 'restored');
    }

    public function scopePurged($query)
    {
        return $query->where('archive_status', 'purged');
    }

    public function scopeByRecordType($query, string $recordType)
    {
        return $query->where('record_type', $recordType);
    }

    public function scopeRestoreEligible($query)
    {
        return $query->where('archive_status', 'archived')
            ->where('restore_eligible_at', '<=', now());
    }

    public function scopePurgeEligible($query)
    {
        return $query->where('archive_status', 'archived')
            ->where('purge_eligible_at', '<=', now());
    }

    public function isArchived(): bool
    {
        return $this->archive_status === 'archived';
    }

    public function isRestored(): bool
    {
        return $this->archive_status === 'restored';
    }

    public function isPurged(): bool
    {
        return $this->archive_status === 'purged';
    }

    public function canBeRestored(): bool
    {
        return $this->isArchived() && $this->restore_eligible_at && $this->restore_eligible_at <= now();
    }

    public function canBePurged(): bool
    {
        return $this->isArchived() && $this->purge_eligible_at && $this->purge_eligible_at <= now();
    }

    public function restore(?int $userId = null): void
    {
        if (! $this->canBeRestored()) {
            throw new \RuntimeException('Archive cannot be restored');
        }

        $this->archive_status = 'restored';
        $this->restored_at = now();
        $this->restored_by = $userId ?? auth()->id();
        $this->save();
    }

    public function purge(?int $userId = null): void
    {
        if (! $this->canBePurged()) {
            throw new \RuntimeException('Archive cannot be purged');
        }

        $this->archive_status = 'purged';
        $this->purged_at = now();
        $this->purged_by = $userId ?? auth()->id();
        $this->save();
    }
}
