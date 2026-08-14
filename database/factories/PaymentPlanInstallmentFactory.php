<?php

namespace Database\Factories;

use App\Models\PaymentPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentPlanInstallmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payment_plan_id' => PaymentPlan::factory(),
            'installment_number' => fake()->numberBetween(1, 12),
            'amount' => fake()->randomFloat(2, 500, 10000),
            'paid_amount' => fake()->randomFloat(2, 0, 10000),
            'due_date' => fake()->date('+30 days'),
            'paid_date' => fake()->optional()->date('+15 days'),
            'status' => fake()->randomElement(['pending', 'paid', 'overdue', 'waived']),
            'payment_id' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
