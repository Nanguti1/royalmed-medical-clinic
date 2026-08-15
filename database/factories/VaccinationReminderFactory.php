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
            'due_date' => now()->addDays(rand(7, 30)),
            'reminder_type' => fake()->randomElement(['sms', 'email', 'whatsapp']),
            'is_sent' => fake()->boolean(50),
            'scheduled_at' => now()->subDays(rand(0, 1))->addDays(rand(0, 7)),
            'sent_at' => fake()->optional(0.5, null) ? now()->subDays(rand(0, 1)) : null,
            'message' => fake()->optional()->sentence(),
            'status' => fake()->optional()->randomElement(['success', 'failed']),
            'error_message' => fake()->optional()->sentence(),
        ];
    }
}
