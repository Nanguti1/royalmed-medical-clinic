<?php

namespace App\Models;

use Database\Factories\LoginSessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginSession extends Model
{
    use HasFactory;

    protected static $factory = LoginSessionFactory::class;

    protected $fillable = [
        'user_id',
        'session_id',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'location',
        'login_at',
        'logout_at',
        'last_activity_at',
        'status',
        'termination_reason',
    ];

    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'location' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeTerminated($query)
    {
        return $query->whereIn('status', ['logged_out', 'terminated']);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('login_at', '>=', now()->subDays($days));
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    public function isTerminated(): bool
    {
        return in_array($this->status, ['logged_out', 'terminated']);
    }

    public function logout(?string $reason = null): void
    {
        $this->status = 'logged_out';
        $this->logout_at = now();
        $this->termination_reason = $reason;
        $this->save();
    }

    public function terminate(string $reason): void
    {
        $this->status = 'terminated';
        $this->logout_at = now();
        $this->termination_reason = $reason;
        $this->save();
    }

    public function expire(): void
    {
        $this->status = 'expired';
        $this->logout_at = now();
        $this->save();
    }

    public function updateLastActivity(): void
    {
        $this->last_activity_at = now();
        $this->save();
    }

    public function getDurationAttribute(): ?int
    {
        if (! $this->logout_at) {
            return null;
        }

        return $this->logout_at->diffInSeconds($this->login_at);
    }
}
