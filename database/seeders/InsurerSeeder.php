<?php

namespace Database\Seeders;

use App\Models\Insurer;
use Illuminate\Database\Seeder;

class InsurerSeeder extends Seeder
{
    public function run(): void
    {
        $insurers = [
            [
                'code' => 'NHIF',
                'name' => 'National Hospital Insurance Fund',
                'type' => 'nhif',
                'contact_person' => 'NHIF Representative',
                'phone' => '+254700000000',
                'email' => 'info@nhif.or.ke',
                'address' => 'NHIF Headquarters, Nairobi',
                'town' => 'Nairobi',
                'postal_code' => '00100',
                'is_active' => true,
            ],
            [
                'code' => 'SHA',
                'name' => 'Social Health Authority',
                'type' => 'sha',
                'contact_person' => 'SHA Representative',
                'phone' => '+254700000001',
                'email' => 'info@sha.go.ke',
                'address' => 'SHA Headquarters, Nairobi',
                'town' => 'Nairobi',
                'postal_code' => '00100',
                'is_active' => true,
            ],
            [
                'code' => 'JUB',
                'name' => 'Jubilee Insurance',
                'type' => 'private',
                'contact_person' => 'Jubilee Representative',
                'phone' => '+254700000002',
                'email' => 'info@jubilee.co.ke',
                'address' => 'Jubilee Insurance House, Nairobi',
                'town' => 'Nairobi',
                'postal_code' => '00100',
                'is_active' => true,
            ],
            [
                'code' => 'AAR',
                'name' => 'AAR Insurance',
                'type' => 'private',
                'contact_person' => 'AAR Representative',
                'phone' => '+254700000003',
                'email' => 'info@aar.co.ke',
                'address' => 'AAR Insurance House, Nairobi',
                'town' => 'Nairobi',
                'postal_code' => '00100',
                'is_active' => true,
            ],
            [
                'code' => 'UAP',
                'name' => 'UAP Insurance',
                'type' => 'private',
                'contact_person' => 'UAP Representative',
                'phone' => '+254700000004',
                'email' => 'info@uap.co.ke',
                'address' => 'UAP Insurance House, Nairobi',
                'town' => 'Nairobi',
                'postal_code' => '00100',
                'is_active' => true,
            ],
        ];

        foreach ($insurers as $insurer) {
            Insurer::updateOrCreate(
                ['code' => $insurer['code']],
                $insurer
            );
        }
    }
}
