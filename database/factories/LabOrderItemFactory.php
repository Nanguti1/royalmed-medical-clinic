<?php

namespace Database\Factories;

use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabOrderItemFactory extends Factory
{
    protected $model = LabOrderItem::class;

    public function definition(): array
    {
        return [
            'lab_order_id' => LabOrder::factory(),
            'lab_test_id' => LabTest::factory(),
            'status' => 'pending',
        ];
    }
}
