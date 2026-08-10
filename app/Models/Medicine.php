<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'generic_name', 'medicine_category_id', 'medicine_form_id', 'strength_id', 'unit_price', 'reorder_level'];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'reorder_level' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(MedicineCategory::class, 'medicine_category_id');
    }

    public function batches()
    {
        return $this->hasMany(InventoryBatch::class);
    }

    public function prescriptionItems()
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
