<?php

namespace Database\Factories;

use App\Models\DentalProcedure;
use App\Models\DentalTreatmentPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalTreatmentItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'treatment_plan_id' => DentalTreatmentPlan::factory(),
            'dental_procedure_id' => DentalProcedure::factory(),
            'tooth_number' => fake()->optional()->randomElement(['11', '12', '13', '14', '15', '16', '17', '18', '21', '22', '23', '24', '25', '26', '27', '28']),
            'tooth_surface' => fake()->optional()->randomElement(['mesial', 'distal', 'occlusal', 'buccal', 'lingual']),
            'description' => fake()->optional()->sentence(),
            'cost' => fake()->randomFloat(2, 100, 2000),
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed', 'cancelled']),
            'scheduled_date' => fake()->optional()->dateBetween('-30 days', '+30 days'),
            'completed_date' => fake()->optional()->dateBetween('-30 days', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
