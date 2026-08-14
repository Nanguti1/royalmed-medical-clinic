<?php

namespace App\Models;

use Database\Factories\RetentionScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RetentionSchedule extends Model
{
    use HasFactory;

    protected static $factory = RetentionScheduleFactory::class;

    protected $fillable = [
        'record_type',
        'retention_period',
        'description',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function recordArchives(): HasMany
    {
        return $this->hasMany(RecordArchive::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRecordType($query, string $recordType)
    {
        return $query->where('record_type', $recordType);
    }

    public function getRetentionYearsAttribute(): ?int
    {
        if (! preg_match('/(\d+)_years/', $this->retention_period, $matches)) {
            return null;
        }

        return (int) $matches[1];
    }

    public function isPermanent(): bool
    {
        return $this->retention_period === 'permanent';
    }
}
