<?php

namespace Database\Factories;

use App\Models\LabResult;
use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabResultFactory extends Factory
{
    protected $model = LabResult::class;

    public function definition(): array
    {
        return [
            'lab_test_id' => LabTest::factory(),
            'lab_order_item_id' => null, // Set explicitly in tests
            'result_value' => fake()->randomElement(['Normal', 'High', 'Low', 'Positive', 'Negative']),
            'units' => fake()->optional()->randomElement(['mg/dL', 'g/L', 'mmol/L', 'U/L']),
            'reference_range' => fake()->optional()->randomElement(['0-100', '5-50', 'Negative']),
            'notes' => fake()->optional()->text(),
            'recorded_by' => null, // Set explicitly in tests
            'recorded_at' => fake()->dateTime(),
        ];
    }
}
