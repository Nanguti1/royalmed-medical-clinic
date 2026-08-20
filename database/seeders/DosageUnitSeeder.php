<?php

namespace Database\Seeders;

use App\Models\DosageUnit;
use Illuminate\Database\Seeder;

class DosageUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Milligram', 'abbreviation' => 'mg'],
            ['name' => 'Gram', 'abbreviation' => 'g'],
            ['name' => 'Microgram', 'abbreviation' => 'mcg'],
            ['name' => 'Milliliter', 'abbreviation' => 'mL'],
            ['name' => 'Liter', 'abbreviation' => 'L'],
            ['name' => 'Unit', 'abbreviation' => 'U'],
            ['name' => 'International Unit', 'abbreviation' => 'IU'],
            ['name' => 'Drop', 'abbreviation' => 'gtt'],
            ['name' => 'Tablet', 'abbreviation' => 'tab'],
            ['name' => 'Capsule', 'abbreviation' => 'cap'],
            ['name' => 'Teaspoon', 'abbreviation' => 'tsp'],
            ['name' => 'Tablespoon', 'abbreviation' => 'tbsp'],
            ['name' => 'Puff', 'abbreviation' => 'puff'],
            ['name' => 'Patch', 'abbreviation' => 'patch'],
            ['name' => 'Suppository', 'abbreviation' => 'supp'],
            ['name' => 'Application', 'abbreviation' => 'appl'],
        ];

        foreach ($units as $unit) {
            DosageUnit::firstOrCreate(
                ['name' => $unit['name']],
                ['abbreviation' => $unit['abbreviation']]
            );
        }
    }
}
