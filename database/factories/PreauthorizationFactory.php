<?php

namespace Database\Factories;

use App\Models\Insurer;
use App\Models\Patient;
use App\Models\PatientCoverage;
use Illuminate\Database\Eloquent\Factories\Factory;

class PreauthorizationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'authorization_number' => 'PRE'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'insurer_id' => Insurer::factory(),
            'insurance_scheme_id' => null,
            'patient_coverage_id' => PatientCoverage::factory(),
            'visit_id' => null,
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'expired', 'used']),
            'authorized_amount' => fake()->randomFloat(2, 5000, 100000),
            'used_amount' => fake()->randomFloat(2, 0, 50000),
            'requested_services' => fake()->sentence(),
            'diagnosis' => fake()->optional()->sentence(),
            'justification' => fake()->optional()->sentence(),
            'request_date' => fake()->date('-10 days'),
            'approval_date' => fake()->optional()->date('-8 days'),
            'expiry_date' => fake()->optional()->date('+30 days'),
            'usage_date' => fake()->optional()->date('-5 days'),
            'rejection_reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
