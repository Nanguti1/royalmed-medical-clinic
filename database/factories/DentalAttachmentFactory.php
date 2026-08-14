<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class DentalAttachmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'dental_chart_id' => null,
            'dental_note_id' => null,
            'attachment_type' => fake()->randomElement(['xray', 'photo_before', 'photo_after', 'scan']),
            'file_path' => 'dental/'.fake()->uuid().'.jpg',
            'file_name' => fake()->word().'.jpg',
            'file_type' => 'jpg',
            'file_size' => fake()->numberBetween(100000, 5000000),
            'mime_type' => 'image/jpeg',
            'description' => fake()->optional()->sentence(),
        ];
    }
}
