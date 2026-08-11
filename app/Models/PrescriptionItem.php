<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    use HasFactory;

    protected $fillable = ['prescription_id', 'medicine_id', 'dosage_unit_id', 'frequency_id', 'route_id', 'duration_unit_id', 'duration_quantity', 'quantity', 'instructions'];

    protected $casts = [
        'quantity' => 'decimal:2',
        'dispensed_quantity' => 'decimal:2',
        'dispensed_at' => 'datetime',
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function dosageUnit()
    {
        return $this->belongsTo(DosageUnit::class);
    }

    public function frequency()
    {
        return $this->belongsTo(Frequency::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function durationUnit()
    {
        return $this->belongsTo(DurationUnit::class);
    }
}
