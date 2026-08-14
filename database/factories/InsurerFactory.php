<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class InsurerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('INS????')),
            'name' => fake()->company(),
            'type' => fake()->randomElement(['private', 'corporate', 'nhif', 'sha']),
            'contact_person' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->email(),
            'address' => fake()->address(),
            'town' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'is_active' => true,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
