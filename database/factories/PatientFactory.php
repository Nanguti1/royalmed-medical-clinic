<?php

namespace Database\Factories;

use App\Models\County;
use App\Models\Gender;
use App\Models\Patient;
use App\Models\SubCounty;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        $county = County::firstOrCreate(['name' => 'Nairobi']);
        $subCounty = SubCounty::firstOrCreate(['name' => 'Westlands', 'county_id' => $county->id]);

        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'other_names' => fake()->optional()->firstName(),
            'date_of_birth' => fake()->date(),
            'gender_id' => Gender::firstOrCreate(['code' => 'male'], ['name' => 'Male'])->id,
            'phone' => fake()->phoneNumber(),
            'email' => fake()->optional()->email(),
            'address' => fake()->address(),
            'county_id' => $county->id,
            'sub_county_id' => $subCounty->id,
        ];
    }
}
