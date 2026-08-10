<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineStrength extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'value'];

    public function medicines()
    {
        return $this->hasMany(Medicine::class, 'strength_id');
    }
}
