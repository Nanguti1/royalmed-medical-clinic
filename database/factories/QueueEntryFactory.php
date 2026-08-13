<?php

namespace Database\Factories;

use App\Models\QueueEntry;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

class QueueEntryFactory extends Factory
{
    protected $model = QueueEntry::class;

    public function definition(): array
    {
        return [
            'visit_id' => Visit::factory(),
            'department' => 'consultation',
            'queue_number' => fake()->unique()->bothify('CQ-####'),
            'position' => fake()->numberBetween(1, 50),
            'priority' => 'normal',
            'status' => 'waiting',
            'called_at' => null,
            'served_at' => null,
        ];
    }
}
