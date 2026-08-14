<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SensitiveDataAccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'record_type',
        'record_id',
        'action',
        'context',
        'access_reason',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    public const UPDATED_AT = null;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByRecordType($query, string $recordType)
    {
        return $query->where('record_type', $recordType);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('accessed_at', '>=', now()->subDays($days));
    }
}
