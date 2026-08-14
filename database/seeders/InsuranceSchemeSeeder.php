<?php

namespace Database\Seeders;

use App\Models\InsuranceScheme;
use App\Models\Insurer;
use Illuminate\Database\Seeder;

class InsuranceSchemeSeeder extends Seeder
{
    public function run(): void
    {
        $nhif = Insurer::where('code', 'NHIF')->first();
        $sha = Insurer::where('code', 'SHA')->first();
        $jubilee = Insurer::where('code', 'JUB')->first();
        $aar = Insurer::where('code', 'AAR')->first();

        $schemes = [
            // NHIF Schemes
            [
                'insurer_id' => $nhif->id,
                'code' => 'NHIF-OUT',
                'name' => 'NHIF Outpatient',
                'scheme_type' => 'outpatient',
                'coverage_limit' => 50000,
                'co_payment_amount' => 0,
                'co_payment_percentage' => 0,
                'requires_preauthorization' => false,
                'is_active' => true,
            ],
            [
                'insurer_id' => $nhif->id,
                'code' => 'NHIF-IN',
                'name' => 'NHIF Inpatient',
                'scheme_type' => 'inpatient',
                'coverage_limit' => 500000,
                'co_payment_amount' => 0,
                'co_payment_percentage' => 0,
                'requires_preauthorization' => true,
                'is_active' => true,
            ],
            // SHA Schemes
            [
                'insurer_id' => $sha->id,
                'code' => 'SHA-COMP',
                'name' => 'SHA Comprehensive',
                'scheme_type' => 'comprehensive',
                'coverage_limit' => 1000000,
                'co_payment_amount' => 500,
                'co_payment_percentage' => 10,
                'requires_preauthorization' => true,
                'is_active' => true,
            ],
            // Jubilee Schemes
            [
                'insurer_id' => $jubilee->id,
                'code' => 'JUB-GOLD',
                'name' => 'Jubilee Gold',
                'scheme_type' => 'comprehensive',
                'coverage_limit' => 2000000,
                'co_payment_amount' => 1000,
                'co_payment_percentage' => 15,
                'requires_preauthorization' => true,
                'is_active' => true,
            ],
            [
                'insurer_id' => $jubilee->id,
                'code' => 'JUB-SILVER',
                'name' => 'Jubilee Silver',
                'scheme_type' => 'outpatient',
                'coverage_limit' => 500000,
                'co_payment_amount' => 500,
                'co_payment_percentage' => 20,
                'requires_preauthorization' => false,
                'is_active' => true,
            ],
            // AAR Schemes
            [
                'insurer_id' => $aar->id,
                'code' => 'AAR-PREMIUM',
                'name' => 'AAR Premium',
                'scheme_type' => 'comprehensive',
                'coverage_limit' => 3000000,
                'co_payment_amount' => 1500,
                'co_payment_percentage' => 10,
                'requires_preauthorization' => true,
                'is_active' => true,
            ],
        ];

        foreach ($schemes as $scheme) {
            InsuranceScheme::updateOrCreate(
                ['code' => $scheme['code']],
                $scheme
            );
        }
    }
}
