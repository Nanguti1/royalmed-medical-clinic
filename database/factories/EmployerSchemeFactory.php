<?php

namespace Database\Factories;

use App\Models\Insurer;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployerSchemeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'contact_person' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->email(),
            'address' => fake()->address(),
            'insurer_id' => Insurer::factory(),
            'insurance_scheme_id' => null,
            'account_number' => fake()->unique()->numerify('ACC########'),
            'credit_limit' => fake()->randomFloat(2, 100000, 1000000),
            'current_balance' => fake()->randomFloat(2, 0, 500000),
            'is_active' => true,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
