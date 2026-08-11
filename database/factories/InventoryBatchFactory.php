<?php

namespace Database\Factories;

use App\Models\InventoryBatch;
use App\Models\Medicine;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryBatchFactory extends Factory
{
    protected $model = InventoryBatch::class;

    public function definition(): array
    {
        return [
            'medicine_id' => Medicine::factory(),
            'batch_number' => fake()->unique()->regexify('[A-Z0-9]{10}'),
            'expiry_date' => fake()->dateTimeBetween('+1 month', '+2 years'),
            'quantity' => fake()->numberBetween(10, 100),
            'purchase_price' => fake()->randomFloat(2, 10, 1000),
            'supplier_id' => null,
            'received_at' => fake()->dateTime(),
        ];
    }

    public function expired(): self
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => now()->subDays(10),
        ]);
    }

    public function expiringSoon(): self
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => now()->addDays(15),
        ]);
    }
}
