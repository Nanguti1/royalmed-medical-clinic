<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RetentionScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'record_type' => fake()->randomElement(['patient_records', 'lab_results', 'prescriptions', 'billing', 'documents']),
            'retention_period' => fake()->randomElement(['7_years', '10_years', '25_years', 'permanent']),
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
            'created_by' => User::factory(),
        ];
    }
}
