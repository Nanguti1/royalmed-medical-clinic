<?php

namespace Database\Factories;

use App\Models\InsuranceScheme;
use App\Models\Insurer;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientCoverageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'insurer_id' => Insurer::factory(),
            'insurance_scheme_id' => InsuranceScheme::factory(),
            'policy_number' => fake()->unique()->numerify('POL########'),
            'member_number' => fake()->optional()->numerify('MEM########'),
            'member_name' => fake()->optional()->name(),
            'relationship' => fake()->randomElement(['self', 'spouse', 'child', 'parent', 'other']),
            'principal_name' => fake()->optional()->name(),
            'principal_policy_number' => fake()->optional()->numerify('POL########'),
            'effective_from' => fake()->dateTimeBetween('-1 year', 'now'),
            'effective_to' => fake()->optional()->dateTimeBetween('+1 year', '+2 years'),
            'is_primary' => true,
            'is_active' => true,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
