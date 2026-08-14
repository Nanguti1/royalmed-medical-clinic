<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalTreatmentPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'plan_number' => 'DTP'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'dentist_id' => User::factory(),
            'dental_chart_id' => null,
            'plan_date' => fake()->date('-30 days'),
            'status' => fake()->randomElement(['draft', 'active', 'completed', 'cancelled']),
            'estimated_cost' => fake()->randomFloat(2, 500, 10000),
            'actual_cost' => fake()->optional()->randomFloat(2, 500, 10000),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
