<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueEntry extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'department', 'queue_number', 'position', 'priority', 'status', 'called_at', 'started_at', 'served_at', 'completed_at', 'waiting_minutes'];

    protected $casts = [
        'called_at' => 'datetime',
        'started_at' => 'datetime',
        'served_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function isWaiting(): bool
    {
        return $this->status === 'waiting';
    }

    public function isCalled(): bool
    {
        return $this->status === 'called' || ! is_null($this->called_at);
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isServed(): bool
    {
        return $this->status === 'completed' || ! is_null($this->served_at) || ! is_null($this->completed_at);
    }

    public function canCall(): bool
    {
        return $this->isWaiting() && ! $this->isServed();
    }

    public function canServe(): bool
    {
        return ($this->isWaiting() || $this->isCalled() || $this->isInProgress()) && ! $this->isServed();
    }

    public function canRemove(): bool
    {
        return ! $this->isServed();
    }
}
