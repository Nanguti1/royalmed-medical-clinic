<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SmsLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'recipient' => fake()->phoneNumber(),
            'message' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'sent', 'failed']),
            'sent_at' => fake()->optional()->dateTime(),
            'gateway' => fake()->randomElement(['log', 'database', 'custom']),
            'error_message' => fake()->optional()->sentence(),
        ];
    }
}
