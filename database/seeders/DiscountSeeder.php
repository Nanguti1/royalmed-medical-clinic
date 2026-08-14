<?php

namespace Database\Seeders;

use App\Models\Discount;
use Illuminate\Database\Seeder;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        $discounts = [
            [
                'code' => 'SENIOR10',
                'name' => 'Senior Citizen Discount',
                'type' => 'percentage',
                'value' => 10,
                'max_discount_amount' => 5000,
                'is_active' => true,
                'applicable_to' => 'all',
                'description' => '10% discount for senior citizens',
            ],
            [
                'code' => 'CASH5',
                'name' => 'Cash Payment Discount',
                'type' => 'percentage',
                'value' => 5,
                'max_discount_amount' => 2000,
                'is_active' => true,
                'applicable_to' => 'all',
                'description' => '5% discount for cash payments',
            ],
            [
                'code' => 'FIXED500',
                'name' => 'Fixed Amount Discount',
                'type' => 'fixed',
                'value' => 500,
                'max_discount_amount' => null,
                'is_active' => true,
                'applicable_to' => 'services',
                'description' => 'KES 500 discount on services',
            ],
        ];

        foreach ($discounts as $discount) {
            Discount::updateOrCreate(
                ['code' => $discount['code']],
                $discount
            );
        }
    }
}
