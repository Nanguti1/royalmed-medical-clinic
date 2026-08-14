<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DentalProcedureFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('PROC????')),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'category' => fake()->randomElement(['scaling', 'filling', 'extraction', 'root_canal', 'crown', 'bridge', 'denture', 'implant', 'orthodontics', 'other']),
            'base_cost' => fake()->randomFloat(2, 100, 5000),
            'duration_minutes' => fake()->numberBetween(15, 120),
            'is_active' => true,
        ];
    }
}
