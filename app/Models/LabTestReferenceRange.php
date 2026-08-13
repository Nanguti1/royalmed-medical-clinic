<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTestReferenceRange extends Model
{
    use HasFactory;

    protected $fillable = ['lab_test_id', 'age_group', 'sex', 'min_value', 'max_value', 'min_operator', 'max_operator', 'text_range'];

    protected $casts = [
        'min_value' => 'decimal:2',
        'max_value' => 'decimal:2',
    ];

    public function test()
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }
}
