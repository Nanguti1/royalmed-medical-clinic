<?php

namespace Database\Factories;

use App\Models\Medicine;
use App\Models\MedicineCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicineFactory extends Factory
{
    protected $model = Medicine::class;

    public function definition(): array
    {
        $category = MedicineCategory::firstOrCreate(['name' => 'General']);

        return [
            'name' => fake()->word(),
            'generic_name' => fake()->optional()->word(),
            'medicine_category_id' => $category->id,
            'medicine_form_id' => null,
            'strength_id' => null,
            'unit_price' => fake()->randomFloat(2, 10, 500),
            'reorder_level' => fake()->numberBetween(5, 20),
        ];
    }
}
