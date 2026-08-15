<?php

namespace Database\Factories;

use App\Models\ConsentTemplate;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientConsentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'consent_number' => 'CON'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'consent_template_id' => ConsentTemplate::factory(),
            'visit_id' => null,
            'consultation_id' => null,
            'status' => fake()->randomElement(['draft', 'signed', 'revoked', 'expired']),
            'signed_at' => fake()->optional(0.7, null) ? now()->subDays(10) : null,
            'revoked_at' => fake()->optional(0.3, null) ? now()->subDays(5) : null,
            'expires_at' => fake()->optional(0.5, null) ? now()->addDays(90) : null,
            'revocation_reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'signed_by' => null,
            'revoked_by' => null,
            'created_by' => fn () => User::factory()->create()->id,
        ];
    }
}
