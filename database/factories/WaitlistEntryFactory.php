<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class WaitlistEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => fake()->optional(User::factory()),
            'dental_chair_id' => null,
            'appointment_type' => fake()->randomElement(['consultation', 'follow_up', 'procedure', 'dental']),
            'reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'requested_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'contacted_at' => fake()->optional()->dateTimeBetween('-29 days', 'now'),
            'status' => fake()->randomElement(['pending', 'contacted', 'scheduled', 'cancelled']),
            'created_by' => User::factory(),
        ];
    }
}
