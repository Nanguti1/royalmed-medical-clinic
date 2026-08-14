<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'insurance_claim_id',
        'from_status',
        'to_status',
        'notes',
        'changed_by',
    ];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(InsuranceClaim::class, 'insurance_claim_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
