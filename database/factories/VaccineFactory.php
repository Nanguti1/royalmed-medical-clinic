<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VaccineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('VAC????')),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'manufacturer' => fake()->optional()->company(),
            'batch_number_format' => fake()->optional()->regexify('[A-Z]{3}-[0-9]{6}'),
            'route' => fake()->randomElement(['intramuscular', 'subcutaneous', 'oral', 'intranasal']),
            'target_diseases' => fake()->optional()->randomElement([['measles'], ['polio'], ['tetanus'], ['measles', 'mumps', 'rubella']]),
            'doses_required' => fake()->numberBetween(1, 3),
            'min_age_months' => fake()->optional()->numberBetween(0, 24),
            'max_age_months' => fake()->optional()->numberBetween(60, 180),
            'interval_days' => fake()->optional()->numberBetween(28, 365),
            'is_active' => true,
        ];
    }
}
