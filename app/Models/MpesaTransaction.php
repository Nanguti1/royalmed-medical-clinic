<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MpesaTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['transaction_id', 'phone', 'amount', 'status', 'occurred_at', 'raw_response'];

    protected $casts = [
        'amount' => 'decimal:2',
        'occurred_at' => 'datetime',
        'raw_response' => 'json',
    ];

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
