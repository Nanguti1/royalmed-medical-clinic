<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceStatus extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name'];

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'status_id');
    }
}
