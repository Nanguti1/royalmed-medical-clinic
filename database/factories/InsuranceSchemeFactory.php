<?php

namespace Database\Factories;

use App\Models\Insurer;
use Illuminate\Database\Eloquent\Factories\Factory;

class InsuranceSchemeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'insurer_id' => Insurer::factory(),
            'code' => strtoupper(fake()->unique()->lexify('SCH????')),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'scheme_type' => fake()->randomElement(['outpatient', 'inpatient', 'comprehensive', 'dental', 'optical']),
            'coverage_limit' => fake()->optional()->randomFloat(2, 10000, 500000),
            'co_payment_amount' => fake()->randomFloat(2, 0, 5000),
            'co_payment_percentage' => fake()->randomFloat(2, 0, 20),
            'requires_preauthorization' => fake()->boolean(30),
            'is_active' => true,
            'effective_from' => fake()->optional()->date(),
            'effective_to' => fake()->optional()->dateTimeBetween('+1 year', '+2 years'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
