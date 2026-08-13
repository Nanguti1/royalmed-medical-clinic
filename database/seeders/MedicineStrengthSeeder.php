<?php

namespace Database\Seeders;

use App\Models\MedicineStrength;
use Illuminate\Database\Seeder;

class MedicineStrengthSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $strengths = [
            ['name' => '75mg'],
            ['name' => '100mg'],
            ['name' => '200mg'],
            ['name' => '250mg'],
            ['name' => '400mg'],
            ['name' => '500mg'],
            ['name' => '1000mg'],
            ['name' => '5mg'],
            ['name' => '10mg'],
            ['name' => '20mg'],
            ['name' => '40mg'],
            ['name' => '50mg'],
            ['name' => '80mg'],
            ['name' => '1mg'],
            ['name' => '2mg'],
            ['name' => '4mg'],
            ['name' => '8mg'],
            ['name' => '125mg'],
            ['name' => '150mg'],
            ['name' => '300mg'],
            ['name' => '600mg'],
            ['name' => '25mg'],
            ['name' => '12.5mg'],
        ];

        foreach ($strengths as $strength) {
            MedicineStrength::firstOrCreate(
                ['name' => $strength['name']]
            );
        }

        $this->command->info('Medicine strengths seeded successfully.');
    }
}
