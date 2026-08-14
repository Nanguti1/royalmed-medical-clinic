<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalNoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'dentist_id' => User::factory(),
            'visit_id' => null,
            'treatment_plan_id' => null,
            'note_date' => fake()->date('-30 days'),
            'clinical_notes' => fake()->paragraph(),
            'treatment_performed' => fake()->optional()->paragraph(),
            'prescriptions' => fake()->optional()->paragraph(),
            'follow_up_instructions' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
