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
                'name' => 'Cash',
                'type' => 'cash',
                'provider' => null,
                'details' => null,
                'is_active' => true,
            ],
            [
                'name' => 'M-Pesa',
                'type' => 'mpesa',
                'provider' => 'Safaricom',
                'details' => json_encode([
                    'type' => 'manual',
                    'description' => 'Manual M-Pesa transaction recording',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Card Payment',
                'type' => 'card',
                'provider' => 'Generic',
                'details' => json_encode([
                    'description' => 'Credit/Debit card payments',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Bank Transfer',
                'type' => 'bank_transfer',
                'provider' => 'Generic',
                'details' => json_encode([
                    'description' => 'Bank transfer payments',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Cheque',
                'type' => 'cheque',
                'provider' => 'Generic',
                'details' => json_encode([
                    'description' => 'Cheque payments',
                ]),
                'is_active' => true,
            ],
        ];

        foreach ($methods as $method) {
            $existing = PaymentMethod::where('name', $method['name'])->first();
            if ($existing) {
                $existing->update([
                    'type' => $method['type'],
                    'provider' => $method['provider'],
                    'details' => $method['details'],
                    'is_active' => $method['is_active'],
                ]);
            } else {
                PaymentMethod::create($method);
            }
        }
    }
}
