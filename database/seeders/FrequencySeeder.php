<?php

namespace Database\Seeders;

use App\Models\Frequency;
use Illuminate\Database\Seeder;

class FrequencySeeder extends Seeder
{
    public function run(): void
    {
        $frequencies = [
            ['name' => 'Once daily'],
            ['name' => 'Twice daily'],
            ['name' => 'Three times daily'],
            ['name' => 'Four times daily'],
            ['name' => 'Every 4 hours'],
            ['name' => 'Every 6 hours'],
            ['name' => 'Every 8 hours'],
            ['name' => 'Every 12 hours'],
            ['name' => 'Every 24 hours'],
            ['name' => 'As needed'],
            ['name' => 'Before meals'],
            ['name' => 'After meals'],
            ['name' => 'At bedtime'],
            ['name' => 'Weekly'],
            ['name' => 'Monthly'],
            ['name' => 'Every other day'],
            ['name' => 'Every 2 days'],
            ['name' => 'Every 3 days'],
            ['name' => 'Every week'],
            ['name' => 'Every 2 weeks'],
            ['name' => 'Every month'],
            ['name' => 'Stat (immediately)'],
            ['name' => 'Single dose'],
        ];

        foreach ($frequencies as $frequency) {
            Frequency::firstOrCreate(
                ['name' => $frequency['name']]
            );
        }
    }
}
