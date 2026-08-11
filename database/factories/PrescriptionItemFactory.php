<?php

namespace Database\Factories;

use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class PrescriptionItemFactory extends Factory
{
    protected $model = PrescriptionItem::class;

    public function definition(): array
    {
        return [
            'prescription_id' => Prescription::factory(),
            'medicine_id' => Medicine::factory(),
            'dosage_unit_id' => null,
            'frequency_id' => null,
            'route_id' => null,
            'duration_unit_id' => null,
            'duration_quantity' => null,
            'quantity' => $this->faker->randomFloat(2, 1, 100),
            'instructions' => $this->faker->optional()->sentence(),
        ];
    }

    public function withDispensedQuantity(float $dispensedQuantity): self
    {
        return $this->state(fn (array $attributes) => [
            'dispensed_quantity' => $dispensedQuantity,
            'dispensed_at' => now(),
        ]);
    }
}
