<?php

namespace Database\Factories;

use App\Models\EmployerScheme;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientEmployerCoverageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'employer_scheme_id' => EmployerScheme::factory(),
            'employee_number' => fake()->numerify('EMP########'),
            'department' => fake()->optional()->word(),
            'effective_from' => fake()->date('-1 year'),
            'effective_to' => fake()->optional()->date('+2 years'),
            'is_active' => true,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
