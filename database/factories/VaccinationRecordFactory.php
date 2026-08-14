<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use App\Models\Vaccine;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaccinationRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'record_number' => 'VAC'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'vaccine_id' => Vaccine::factory(),
            'visit_id' => null,
            'administered_by' => User::factory(),
            'administration_date' => fake()->date('-30 days'),
            'dose_number' => fake()->numberBetween(1, 3),
            'batch_number' => fake()->optional()->regexify('[A-Z]{3}-[0-9]{6}'),
            'expiry_date' => fake()->optional()->date('+2 years'),
            'site' => fake()->randomElement(['left_arm', 'right_arm', 'thigh']),
            'route' => fake()->randomElement(['intramuscular', 'subcutaneous', 'oral', 'intranasal']),
            'dosage' => fake()->optional()->randomFloat(3, 0.1, 5),
            'dosage_unit' => fake()->optional()->randomElement(['ml', 'mg']),
            'reactions' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'next_due_date' => fake()->optional()->dateBetween('+30 days', '+180 days'),
            'status' => fake()->randomElement(['administered', 'scheduled', 'deferred', 'contraindicated']),
        ];
    }
}
