<?php

namespace Database\Factories;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentReminderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::factory(),
            'reminder_type' => fake()->randomElement(['sms', 'email', 'whatsapp']),
            'is_sent' => fake()->boolean(50),
            'scheduled_at' => fake()->dateTimeBetween('-1 day', '+1 day'),
            'sent_at' => fake()->optional()->dateTimeBetween('-1 day', 'now'),
            'message' => fake()->optional()->sentence(),
            'status' => fake()->optional()->randomElement(['success', 'failed']),
            'error_message' => fake()->optional()->sentence(),
        ];
    }
}
