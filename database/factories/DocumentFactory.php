<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'document_number' => 'DOC'.fake()->unique()->numerify('########'),
            'patient_id' => Patient::factory(),
            'visit_id' => null,
            'consultation_id' => null,
            'lab_result_id' => null,
            'uploaded_by' => User::factory(),
            'title' => fake()->sentence(4),
            'category' => fake()->randomElement(['clinical', 'lab', 'consent', 'dental', 'scanned', 'general']),
            'file_path' => 'documents/'.fake()->uuid().'.pdf',
            'file_name' => fake()->word().'.pdf',
            'file_type' => 'pdf',
            'file_size' => fake()->numberBetween(10000, 5000000),
            'mime_type' => 'application/pdf',
            'description' => fake()->optional()->sentence(),
            'is_sensitive' => fake()->boolean(20),
            'is_confidential' => fake()->boolean(10),
            'uploaded_at' => fake()->dateTime('-30 days'),
            'expires_at' => fake()->optional()->dateTime('+180 days'),
            'storage_location' => 'local',
            'metadata' => fake()->optional()->randomElement([['uploaded_via' => 'web'], ['uploaded_via' => 'api']]),
        ];
    }
}
