<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'provider', 'details'];

    protected $casts = [
        'details' => 'json',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
