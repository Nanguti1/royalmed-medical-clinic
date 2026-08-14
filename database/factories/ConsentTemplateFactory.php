<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConsentTemplateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('CONS????')),
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement(['treatment', 'surgery', 'anesthesia', 'research', 'data_sharing', 'photography']),
            'content' => fake()->paragraphs(3, true),
            'description' => fake()->optional()->sentence(),
            'requires_signature' => true,
            'requires_witness' => fake()->boolean(30),
            'is_active' => true,
            'validity_days' => fake()->optional()->numberBetween(30, 365),
            'minimum_age' => 18,
            'version' => '1.0',
            'effective_from' => fake()->date('-1 year'),
            'effective_to' => fake()->optional()->date('+2 years'),
            'created_by' => User::factory(),
        ];
    }
}
