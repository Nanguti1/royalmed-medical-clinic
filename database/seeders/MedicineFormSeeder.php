<?php

namespace Database\Seeders;

use App\Models\MedicineForm;
use Illuminate\Database\Seeder;

class MedicineFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $forms = [
            ['name' => 'Tablet'],
            ['name' => 'Capsule'],
            ['name' => 'Syrup'],
            ['name' => 'Injection'],
            ['name' => 'Cream'],
            ['name' => 'Ointment'],
            ['name' => 'Inhaler'],
            ['name' => 'Drops'],
            ['name' => 'Suppository'],
            ['name' => 'Patch'],
        ];

        foreach ($forms as $form) {
            MedicineForm::firstOrCreate(
                ['name' => $form['name']]
            );
        }

        $this->command->info('Medicine forms seeded successfully.');
    }
}
