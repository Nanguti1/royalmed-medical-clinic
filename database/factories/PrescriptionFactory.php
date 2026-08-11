<?php

namespace Database\Factories;

use App\Models\Prescription;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

class PrescriptionFactory extends Factory
{
    protected $model = Prescription::class;

    public function definition(): array
    {
        return [
            'visit_id' => Visit::factory(),
            'prescribed_by' => null,
            'notes' => $this->faker->optional()->sentence(),
            'finalized_at' => null,
            'dispensed_at' => null,
        ];
    }

    public function finalized(): self
    {
        return $this->state(fn (array $attributes) => [
            'finalized_at' => now(),
            'prescription_number' => 'P-'.now()->format('Ymd').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
        ]);
    }

    public function dispensed(): self
    {
        return $this->state(fn (array $attributes) => [
            'finalized_at' => now(),
            'dispensed_at' => now(),
            'prescription_number' => 'P-'.now()->format('Ymd').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
        ]);
    }
}
