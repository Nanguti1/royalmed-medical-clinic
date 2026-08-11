<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'payment_method_id' => PaymentMethod::inRandomOrder()->first()?->id,
            'amount' => fake()->randomFloat(2, 100, 5000),
            'paid_at' => fake()->dateTime(),
            'reference' => fake()->optional()->regexify('[A-Z0-9]{10}'),
            'mpesa_transaction_id' => null,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Payment $payment) {
            // Use server update mode to set receipt_number
            Payment::withServerUpdate(function () use ($payment) {
                $payment->update([
                    'receipt_number' => 'R-'.fake()->unique()->numerify('######'),
                ]);
            });
        });
    }
}
