<?php

namespace Database\Seeders;

use App\Models\MedicineCategory;
use Illuminate\Database\Seeder;

class MedicineCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Antibiotics'],
            ['name' => 'Analgesics'],
            ['name' => 'Antihypertensives'],
            ['name' => 'Antidiabetics'],
            ['name' => 'Antihistamines'],
            ['name' => 'Antacids'],
            ['name' => 'Cardiovascular'],
            ['name' => 'Respiratory'],
            ['name' => 'Vitamins'],
            ['name' => 'Antifungal'],
        ];

        foreach ($categories as $category) {
            MedicineCategory::firstOrCreate(
                ['name' => $category['name']]
            );
        }

        $this->command->info('Medicine categories seeded successfully.');
    }
}
