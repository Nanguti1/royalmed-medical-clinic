<?php

namespace Database\Factories;

use App\Models\DentalChart;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalToothFactory extends Factory
{
    public function definition(): array
    {
        return [
            'dental_chart_id' => DentalChart::factory(),
            'tooth_number' => fake()->randomElement(['11', '12', '13', '14', '15', '16', '17', '18', '21', '22', '23', '24', '25', '26', '27', '28']),
            'tooth_name' => fake()->optional()->randomElement(['Central Incisor', 'Lateral Incisor', 'Canine', 'Premolar', 'Molar']),
            'conditions' => fake()->optional()->randomElement([['caries'], ['missing'], ['filled'], ['caries', 'filled']]),
            'restorations' => fake()->optional()->randomElement([['amalgam'], ['composite'], ['none']]),
            'mobility' => fake()->optional()->randomElement([['grade' => 0], ['grade' => 1], ['grade' => 2]]),
            'is_extracted' => fake()->boolean(5),
            'extraction_date' => fake()->optional()->date('-5 years'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
