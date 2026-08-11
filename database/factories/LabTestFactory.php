<?php

namespace Database\Factories;

use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabTestFactory extends Factory
{
    protected $model = LabTest::class;

    public function definition(): array
    {
        return [
            'code' => fake()->optional()->regexify('[A-Z]{3}[0-9]{3}'),
            'name' => fake()->randomElement(['CBC', 'Blood Glucose', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Thyroid Panel']),
            'description' => fake()->optional()->text(),
            'standard_units' => fake()->optional()->randomElement(['mg/dL', 'g/L', 'mmol/L', 'U/L', 'pg/mL']),
            'price' => fake()->randomFloat(2, 50, 500),
        ];
    }
}
