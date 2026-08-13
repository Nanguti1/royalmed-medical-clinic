<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class County extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'headquarters'];

    public function sub_counties()
    {
        return $this->hasMany(SubCounty::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }
}
