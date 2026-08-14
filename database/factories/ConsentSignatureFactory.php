<?php

namespace Database\Factories;

use App\Models\PatientConsent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConsentSignatureFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_consent_id' => PatientConsent::factory(),
            'signer_type' => fake()->randomElement(['patient', 'guardian', 'witness', 'provider']),
            'signer_id' => fake()->optional(User::factory()),
            'signer_name' => fake()->name(),
            'relationship' => fake()->optional()->randomElement(['parent', 'spouse', 'guardian', 'relative']),
            'signature_data' => fake()->optional()->sha256(),
            'signature_method' => fake()->randomElement(['digital', 'handwritten', 'typed']),
            'ip_address' => fake()->optional()->ipv4(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
