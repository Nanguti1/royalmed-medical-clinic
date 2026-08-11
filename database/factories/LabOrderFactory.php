<?php

namespace Database\Factories;

use App\Models\LabOrder;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabOrderFactory extends Factory
{
    protected $model = LabOrder::class;

    public function definition(): array
    {
        return [
            'visit_id' => Visit::factory(),
            'ordered_by' => User::factory(),
            'order_date' => fake()->dateTime(),
            'status' => 'ordered',
            'notes' => fake()->optional()->text(),
        ];
    }
}
