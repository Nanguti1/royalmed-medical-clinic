<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RefundFactory extends Factory
{
    public function definition(): array
    {
        return [
            'refund_number' => 'REF'.fake()->unique()->numerify('########'),
            'payment_id' => Payment::factory(),
            'credit_note_id' => null,
            'reason' => fake()->randomElement(['overpayment', 'service_cancellation', 'return', 'error', 'other']),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'status' => fake()->randomElement(['pending', 'approved', 'processed', 'rejected']),
            'requested_date' => fake()->date('-15 days'),
            'approved_date' => fake()->optional()->date('-10 days'),
            'processed_date' => fake()->optional()->date('-5 days'),
            'refund_method' => fake()->randomElement(['original', 'cash', 'bank_transfer']),
            'bank_name' => fake()->optional()->company(),
            'bank_account' => fake()->optional()->numerify('##########'),
            'rejection_reason' => fake()->optional()->sentence(),
            'requested_by' => User::factory(),
            'approved_by' => fake()->optional(User::factory()),
            'processed_by' => fake()->optional(User::factory()),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
