<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            AuthorizationSeeder::class,
            GenderSeeder::class,
            CountySeeder::class,
            PaymentMethodSeeder::class,
            InvoiceStatusSeeder::class,
            MedicineCategorySeeder::class,
            MedicineFormSeeder::class,
            MedicineStrengthSeeder::class,
            MedicineSeeder::class,
        ]);

        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Nanguti - SA',
                'password' => Hash::make('123123'),
                'is_active' => true,
            ]
        );

        $superAdmin->assignRole('Super Admin');
    }
}
