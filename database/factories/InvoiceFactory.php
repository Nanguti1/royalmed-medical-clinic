<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceStatus;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'visit_id' => Visit::factory(),
            'invoice_number' => 'INV-'.fake()->unique()->numerify('######'),
            'issued_at' => fake()->dateTime(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Invoice $invoice) {
            $status = InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid']);
            $totalAmount = fake()->randomFloat(2, 500, 10000);

            // Use server update mode to set protected fields
            Invoice::withServerUpdate(function () use ($invoice, $status, $totalAmount) {
                $invoice->update([
                    'status_id' => $status->id,
                    'total_amount' => $totalAmount,
                    'due_amount' => $totalAmount,
                ]);
            });
        });
    }
}
