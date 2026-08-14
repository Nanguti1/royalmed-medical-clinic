<?php

namespace App\Models;

use Database\Factories\WhatsAppLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppLog extends Model
{
    use HasFactory;

    protected static $factory = WhatsAppLogFactory::class;

    protected $fillable = [
        'recipient',
        'message',
        'status',
        'sent_at',
        'gateway',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function markAsSent(): void
    {
        $this->status = 'sent';
        $this->sent_at = now();
        $this->save();
    }

    public function markAsFailed(string $error): void
    {
        $this->status = 'failed';
        $this->error_message = $error;
        $this->save();
    }
}
