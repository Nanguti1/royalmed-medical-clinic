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
            'signed_at' => fake()->optional()->dateTime('-10 days'),
            'revoked_at' => fake()->optional()->dateTime('-5 days'),
            'expires_at' => fake()->optional()->dateTime('+90 days'),
            'revocation_reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'signed_by' => fake()->optional(User::factory()),
            'revoked_by' => fake()->optional(User::factory()),
            'created_by' => User::factory(),
        ];
    }
}
