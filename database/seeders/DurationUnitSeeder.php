<?php

namespace Database\Seeders;

use App\Models\DurationUnit;
use Illuminate\Database\Seeder;

class DurationUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Day(s)'],
            ['name' => 'Week(s)'],
            ['name' => 'Month(s)'],
            ['name' => 'Year(s)'],
            ['name' => 'Hour(s)'],
            ['name' => 'Minute(s)'],
        ];

        foreach ($units as $unit) {
            DurationUnit::firstOrCreate(
                ['name' => $unit['name']]
            );
        }
    }
}
