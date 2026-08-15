<?php

namespace Database\Factories;

use App\Models\Consultation;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConsultationFactory extends Factory
{
    protected $model = Consultation::class;

    public function definition(): array
    {
        return [
            'visit_id' => Visit::factory(),
            'provider_id' => User::factory(),
            'chief_complaint' => fake()->sentence(),
            'history' => fake()->paragraph(),
            'examination' => fake()->paragraph(),
            'plan' => fake()->paragraph(),
            'notes' => fake()->paragraph(),
            'subjective' => fake()->paragraph(),
            'objective' => fake()->paragraph(),
            'assessment' => fake()->paragraph(),
            'follow_up_date' => fake()->optional()->date(),
            'follow_up_notes' => fake()->optional()->sentence(),
            'follow_up_type' => fake()->randomElement(['in-person', 'phone', 'video']),
        ];
    }
}
