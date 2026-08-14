<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CreditNoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'credit_note_number' => 'CN'.fake()->unique()->numerify('########'),
            'invoice_id' => Invoice::factory(),
            'payment_id' => Payment::factory(),
            'reason' => fake()->randomElement(['refund', 'return', 'discount', 'adjustment', 'cancellation']),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'tax_amount' => fake()->randomFloat(2, 0, 1000),
            'total_amount' => fake()->randomFloat(2, 100, 11000),
            'description' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(['issued', 'applied', 'voided']),
            'issued_date' => fake()->date('-30 days'),
            'applied_date' => fake()->optional()->date('-25 days'),
            'issued_by' => User::factory(),
            'approved_by' => fake()->optional(User::factory()),
            'approved_at' => fake()->optional()->dateTime('-28 days'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
