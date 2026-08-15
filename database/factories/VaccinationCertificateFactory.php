<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use App\Models\VaccinationRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaccinationCertificateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'certificate_number' => 'VCT'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'vaccination_record_id' => VaccinationRecord::factory(),
            'issue_date' => now()->subDays(30),
            'valid_from' => now()->subDays(30),
            'valid_until' => fake()->optional(0.7, null) ? now()->addYears(5) : null,
            'issuing_authority' => 'Royalmed Clinic',
            'issuer_name' => fake()->optional()->name(),
            'issuer_license' => fake()->optional()->regexify('[A-Z]{2}-[0-9]{6}'),
            'file_path' => fake()->optional()->regexify('certificates/[a-z0-9]+.pdf'),
            'file_name' => fake()->optional()->word().'.pdf',
            'status' => fake()->randomElement(['issued', 'revoked', 'expired']),
            'revocation_reason' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
