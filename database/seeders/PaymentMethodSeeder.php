<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'cash',
                'provider' => null,
                'details' => null,
            ],
            [
                'name' => 'mpesa',
                'provider' => 'Safaricom',
                'details' => json_encode([
                    'type' => 'manual',
                    'description' => 'Manual M-Pesa transaction recording',
                ]),
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::firstOrCreate(
                ['name' => $method['name']],
                [
                    'provider' => $method['provider'],
                    'details' => $method['details'],
                ]
            );
        }
    }
}
