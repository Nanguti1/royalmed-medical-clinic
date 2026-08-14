<?php

namespace Database\Factories;

use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $appointmentDate = fake()->dateTimeBetween('-30 days', '+30 days');
        $startTime = fake()->time('09:00:00');
        $endTime = fake()->time('10:00:00');

        return [
            'appointment_number' => 'APT'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'doctor_id' => User::factory(),
            'dental_chair_id' => fake()->optional(DoctorSchedule::factory()),
            'visit_id' => null,
            'consultation_id' => null,
            'appointment_date' => $appointmentDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'appointment_type' => fake()->randomElement(['consultation', 'follow_up', 'procedure', 'dental', 'laboratory', 'walk_in']),
            'status' => fake()->randomElement(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
            'reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'cancellation_reason' => fake()->optional()->sentence(),
            'is_walk_in' => fake()->boolean(10),
            'is_follow_up' => fake()->boolean(30),
            'checked_in_at' => fake()->optional()->dateTime('-29 days'),
            'checked_out_at' => fake()->optional()->dateTime('-29 days'),
            'created_by' => User::factory(),
            'updated_by' => fake()->optional(User::factory()),
        ];
    }
}
