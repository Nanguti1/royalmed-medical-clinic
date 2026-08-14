<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepositFactory extends Factory
{
    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 1000, 50000);

        return [
            'deposit_number' => 'DEP'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'payment_id' => Payment::factory(),
            'amount' => $amount,
            'used_amount' => fake()->randomFloat(2, 0, $amount),
            'remaining_amount' => fake()->randomFloat(2, 0, $amount),
            'status' => fake()->randomElement(['active', 'exhausted', 'refunded', 'expired']),
            'deposit_date' => fake()->date('-60 days'),
            'expiry_date' => fake()->optional()->date('+180 days'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
