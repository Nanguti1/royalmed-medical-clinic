<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalChartFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'dentist_id' => User::factory(),
            'visit_id' => null,
            'chart_date' => fake()->date('-30 days'),
            'chief_complaint' => fake()->optional()->sentence(),
            'medical_history' => fake()->optional()->paragraph(),
            'dental_history' => fake()->optional()->paragraph(),
            'oral_hygiene' => fake()->optional()->randomElement([['brushing' => 'twice daily'], ['brushing' => 'once daily', 'flossing' => 'rarely']]),
            'periodontal_status' => fake()->optional()->randomElement([['status' => 'healthy'], ['status' => 'gingivitis']]),
            'findings' => fake()->optional()->paragraph(),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
