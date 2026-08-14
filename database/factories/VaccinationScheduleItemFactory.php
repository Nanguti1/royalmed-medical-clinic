<?php

namespace Database\Factories;

use App\Models\VaccinationSchedule;
use App\Models\Vaccine;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaccinationScheduleItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vaccination_schedule_id' => VaccinationSchedule::factory(),
            'vaccine_id' => Vaccine::factory(),
            'dose_number' => fake()->numberBetween(1, 3),
            'min_age_months' => fake()->optional()->numberBetween(0, 24),
            'max_age_months' => fake()->optional()->numberBetween(60, 180),
            'recommended_age_months' => fake()->optional()->numberBetween(2, 12),
        ];
    }
}
