<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabCategory extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name', 'description'];

    public function tests()
    {
        return $this->hasMany(LabTest::class, 'lab_category_id');
    }
}
