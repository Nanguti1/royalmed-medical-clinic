<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DrugInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id_1',
        'medicine_id_2',
        'severity',
        'description',
        'recommendation',
    ];

    public function medicine1(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id_1');
    }

    public function medicine2(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id_2');
    }

    public static function findInteraction(int $medicineId1, int $medicineId2): ?self
    {
        return self::where(function ($query) use ($medicineId1, $medicineId2) {
            $query->where('medicine_id_1', $medicineId1)->where('medicine_id_2', $medicineId2);
        })->orWhere(function ($query) use ($medicineId1, $medicineId2) {
            $query->where('medicine_id_1', $medicineId2)->where('medicine_id_2', $medicineId1);
        })->first();
    }
}
