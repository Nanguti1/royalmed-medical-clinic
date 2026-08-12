<?php

namespace Database\Seeders;

use App\Models\InvoiceStatus;
use Illuminate\Database\Seeder;

class InvoiceStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['code' => 'unpaid', 'name' => 'Unpaid'],
            ['code' => 'partial', 'name' => 'Partial'],
            ['code' => 'paid', 'name' => 'Paid'],
            ['code' => 'cancelled', 'name' => 'Cancelled'],
        ];

        foreach ($statuses as $status) {
            InvoiceStatus::firstOrCreate(
                ['code' => $status['code']],
                ['name' => $status['name']]
            );
        }
    }
}
