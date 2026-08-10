<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DosageUnit extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'abbreviation'];

    public function prescriptionItems()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
