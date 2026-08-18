<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentAccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'user_id',
        'action',
        'ip_address',
        'user_agent',
        'access_reason',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    public const CREATED_AT = 'accessed_at';

    public const UPDATED_AT = null;

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
