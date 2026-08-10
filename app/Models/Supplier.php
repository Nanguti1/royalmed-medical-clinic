<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'contact_name', 'phone', 'email', 'address', 'notes'];

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function batches()
    {
        return $this->hasMany(InventoryBatch::class);
    }
}
