<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    public function definition(): array
    {
        $quantity = fake()->randomFloat(2, 1, 10);
        $unitPrice = fake()->randomFloat(2, 100, 5000);

        return [
            'invoice_id' => Invoice::factory(),
            'description' => fake()->sentence(3),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'tax' => fake()->randomFloat(2, 0, 100),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (InvoiceItem $item) {
            $total = round($item->quantity * $item->unit_price, 2);
            $item->update(['total_price' => $total]);
        });
    }
}
