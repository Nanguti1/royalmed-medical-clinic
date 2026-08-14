<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'doctor_id' => User::factory(),
            'day_of_week' => fake()->randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
            'start_time' => fake()->time('08:00:00'),
            'end_time' => fake()->time('17:00:00'),
            'session_type' => fake()->randomElement(['regular', 'extended', 'emergency']),
            'is_available' => true,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
