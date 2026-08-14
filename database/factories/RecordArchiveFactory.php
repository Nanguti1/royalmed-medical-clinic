<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecordArchiveFactory extends Factory
{
    public function definition(): array
    {
        return [
            'archive_number' => 'ARC'.fake()->unique()->numerify('########'),
            'record_type' => fake()->randomElement(['patient_records', 'lab_results', 'prescriptions', 'billing', 'documents']),
            'record_id' => fake()->numberBetween(1, 10000),
            'retention_schedule_id' => null,
            'archive_status' => fake()->randomElement(['archived', 'restored', 'purged']),
            'archived_at' => fake()->dateTime('-1 year'),
            'restore_eligible_at' => fake()->optional()->dateTime('+6 years'),
            'purge_eligible_at' => fake()->optional()->dateTime('+7 years'),
            'restored_at' => fake()->optional()->dateTime('-6 months'),
            'purged_at' => fake()->optional()->dateTime('-6 months'),
            'archive_reason' => fake()->sentence(),
            'archived_by' => User::factory(),
            'restored_by' => fake()->optional(User::factory()),
            'purged_by' => fake()->optional(User::factory()),
            'metadata' => fake()->optional()->randomElement([['reason' => 'patient_request'], ['reason' => 'policy']]),
        ];
    }
}
