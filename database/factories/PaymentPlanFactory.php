<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentPlanFactory extends Factory
{
    public function definition(): array
    {
        $totalAmount = fake()->randomFloat(2, 1000, 50000);
        $installmentCount = fake()->numberBetween(2, 12);

        return [
            'invoice_id' => Invoice::factory(),
            'patient_id' => Patient::factory(),
            'status' => fake()->randomElement(['active', 'completed', 'cancelled', 'defaulted']),
            'total_amount' => $totalAmount,
            'paid_amount' => fake()->randomFloat(2, 0, $totalAmount),
            'remaining_amount' => fake()->randomFloat(2, 0, $totalAmount),
            'installment_count' => $installmentCount,
            'completed_installments' => fake()->numberBetween(0, $installmentCount),
            'frequency' => fake()->randomElement(['weekly', 'biweekly', 'monthly']),
            'start_date' => fake()->date('-30 days'),
            'end_date' => fake()->optional()->date('+1 year'),
            'next_payment_date' => fake()->date('+15 days'),
            'installment_amount' => $totalAmount / $installmentCount,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
