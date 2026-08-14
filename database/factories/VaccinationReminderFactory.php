<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\VaccinationRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaccinationReminderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vaccination_record_id' => VaccinationRecord::factory(),
            'patient_id' => Patient::factory(),
            'due_date' => fake()->dateBetween('+7 days', '+30 days'),
            'reminder_type' => fake()->randomElement(['sms', 'email', 'whatsapp']),
            'is_sent' => fake()->boolean(50),
            'scheduled_at' => fake()->dateTimeBetween('-1 day', '+7 days'),
            'sent_at' => fake()->optional()->dateTimeBetween('-1 day', 'now'),
            'message' => fake()->optional()->sentence(),
            'status' => fake()->optional()->randomElement(['success', 'failed']),
            'error_message' => fake()->optional()->sentence(),
        ];
    }
}
