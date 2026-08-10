<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabResult extends Model
{
    use HasFactory;

    protected $fillable = ['lab_test_id', 'lab_order_item_id', 'result_value', 'units', 'reference_range', 'notes', 'recorded_by', 'recorded_at'];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public function test()
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(LabOrderItem::class, 'lab_order_item_id');
    }
}
