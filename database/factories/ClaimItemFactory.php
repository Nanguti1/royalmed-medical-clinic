<?php

namespace Database\Factories;

use App\Models\InsuranceClaim;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClaimItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'insurance_claim_id' => InsuranceClaim::factory(),
            'invoice_item_id' => null,
            'service_code' => fake()->optional()->numerify('SRV###'),
            'service_name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'quantity' => fake()->randomFloat(2, 1, 10),
            'unit_price' => fake()->randomFloat(2, 100, 5000),
            'claimed_amount' => fake()->randomFloat(2, 100, 50000),
            'approved_amount' => fake()->randomFloat(2, 0, 50000),
            'rejected_amount' => fake()->randomFloat(2, 0, 10000),
            'rejection_reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
