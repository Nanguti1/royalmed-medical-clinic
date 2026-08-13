<?php

namespace Database\Seeders;

use App\Models\Gender;
use Illuminate\Database\Seeder;

class GenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genders = [
            ['code' => 'M', 'name' => 'Male'],
            ['code' => 'F', 'name' => 'Female'],
            ['code' => 'O', 'name' => 'Other'],
        ];

        foreach ($genders as $gender) {
            Gender::firstOrCreate(
                ['code' => $gender['code']],
                ['name' => $gender['name']]
            );
        }
    }
}
