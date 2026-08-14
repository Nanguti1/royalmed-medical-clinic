<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VaccinationScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'schedule_name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'schedule_type' => fake()->randomElement(['routine', 'catch_up', 'special']),
            'is_active' => true,
        ];
    }
}
