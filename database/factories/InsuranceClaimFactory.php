<?php

namespace Database\Factories;

use App\Models\Insurer;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\PatientCoverage;
use Illuminate\Database\Eloquent\Factories\Factory;

class InsuranceClaimFactory extends Factory
{
    public function definition(): array
    {
        return [
            'claim_number' => 'CLM'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'insurer_id' => Insurer::factory(),
            'insurance_scheme_id' => null,
            'patient_coverage_id' => PatientCoverage::factory(),
            'employer_scheme_id' => null,
            'invoice_id' => Invoice::factory(),
            'status' => fake()->randomElement(['draft', 'submitted', 'pending', 'approved', 'rejected', 'partially_paid', 'paid']),
            'claimed_amount' => fake()->randomFloat(2, 1000, 50000),
            'approved_amount' => fake()->randomFloat(2, 0, 50000),
            'rejected_amount' => fake()->randomFloat(2, 0, 10000),
            'paid_amount' => fake()->randomFloat(2, 0, 50000),
            'service_date_from' => fake()->date('-30 days'),
            'service_date_to' => fake()->date('-30 days'),
            'submission_date' => fake()->optional()->date('-25 days'),
            'approval_date' => fake()->optional()->date('-20 days'),
            'payment_date' => fake()->optional()->date('-15 days'),
            'authorization_number' => fake()->optional()->numerify('AUTH########'),
            'rejection_reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
