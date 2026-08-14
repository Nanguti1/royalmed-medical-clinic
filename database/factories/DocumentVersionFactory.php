<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentVersionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'version_number' => fake()->numberBetween(1, 5),
            'file_path' => 'documents/'.fake()->uuid().'.pdf',
            'file_name' => fake()->word().'.pdf',
            'file_type' => 'pdf',
            'file_size' => fake()->numberBetween(10000, 5000000),
            'mime_type' => 'application/pdf',
            'uploaded_by' => User::factory(),
            'change_notes' => fake()->optional()->sentence(),
        ];
    }
}
