<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalChairScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'chair_name' => fake()->words(2, true),
            'chair_number' => 'CHAIR'.fake()->unique()->numerify('###'),
            'dentist_id' => fake()->optional(0.5, null) ? User::factory() : null,
            'day_of_week' => fake()->randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
            'start_time' => fake()->time('09:00:00'),
            'end_time' => fake()->time('17:00:00'),
            'is_available' => true,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
