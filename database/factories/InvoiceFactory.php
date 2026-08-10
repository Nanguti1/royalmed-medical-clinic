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
        $status = InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid']);

        return [
            'visit_id' => Visit::factory(),
            'invoice_number' => 'INV-' . fake()->unique()->numerify('######'),
            'status_id' => $status->id,
            'total_amount' => fake()->randomFloat(2, 500, 10000),
            'due_amount' => fake()->randomFloat(2, 500, 10000),
            'issued_at' => fake()->dateTime(),
        ];
    }
}
