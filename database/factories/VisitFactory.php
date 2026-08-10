<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\Visit;
use App\Models\VisitStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class VisitFactory extends Factory
{
    protected $model = Visit::class;

    public function definition(): array
    {
        $status = VisitStatus::firstOrCreate(['code' => 'pending'], ['name' => 'Pending']);

        return [
            'patient_id' => Patient::factory(),
            'visit_date' => fake()->dateTime(),
            'visit_status_id' => $status->id,
            'notes' => fake()->optional()->text(),
        ];
    }
}
