<?php

namespace Database\Factories;

use App\Models\Deposit;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepositAllocationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'deposit_id' => Deposit::factory(),
            'payment_id' => Payment::factory(),
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'allocated_at' => fake()->dateTime('-10 days'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
