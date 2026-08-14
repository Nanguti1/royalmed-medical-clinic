<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DiscountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('DISC????')),
            'name' => fake()->words(2, true),
            'type' => fake()->randomElement(['percentage', 'fixed']),
            'value' => fake()->randomFloat(2, 5, 50),
            'max_discount_amount' => fake()->optional()->randomFloat(2, 100, 5000),
            'is_active' => true,
            'valid_from' => fake()->optional()->date('-30 days'),
            'valid_to' => fake()->optional()->date('+180 days'),
            'applicable_to' => fake()->randomElement(['all', 'services', 'medicines', 'lab_tests']),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
