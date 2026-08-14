<?php

namespace Database\Seeders;

use App\Models\DentalProcedure;
use Illuminate\Database\Seeder;

class DentalProcedureSeeder extends Seeder
{
    public function run(): void
    {
        $procedures = [
            // Scaling
            [
                'code' => 'SCL_PRO',
                'name' => 'Professional Scaling',
                'category' => 'scaling',
                'description' => 'Professional teeth cleaning and scaling',
                'base_cost' => 2000,
                'duration_minutes' => 30,
            ],
            [
                'code' => 'SCL_DEEP',
                'name' => 'Deep Scaling',
                'category' => 'scaling',
                'description' => 'Deep scaling below gum line',
                'base_cost' => 3500,
                'duration_minutes' => 45,
            ],
            // Fillings
            [
                'code' => 'FIL_COM',
                'name' => 'Composite Filling',
                'category' => 'filling',
                'description' => 'Tooth-colored composite resin filling',
                'base_cost' => 5000,
                'duration_minutes' => 30,
            ],
            [
                'code' => 'FIL_AMG',
                'name' => 'Amalgam Filling',
                'category' => 'filling',
                'description' => 'Silver amalgam filling',
                'base_cost' => 3000,
                'duration_minutes' => 30,
            ],
            [
                'code' => 'FIL_GIC',
                'name' => 'Glass Ionomer Filling',
                'category' => 'filling',
                'description' => 'Glass ionomer filling',
                'base_cost' => 2500,
                'duration_minutes' => 25,
            ],
            // Extractions
            [
                'code' => 'EXT_SIM',
                'name' => 'Simple Extraction',
                'category' => 'extraction',
                'description' => 'Simple tooth extraction',
                'base_cost' => 2000,
                'duration_minutes' => 30,
            ],
            [
                'code' => 'EXT_SURG',
                'name' => 'Surgical Extraction',
                'category' => 'extraction',
                'description' => 'Surgical tooth extraction',
                'base_cost' => 5000,
                'duration_minutes' => 60,
            ],
            [
                'code' => 'EXT_WIS',
                'name' => 'Wisdom Tooth Extraction',
                'category' => 'extraction',
                'description' => 'Wisdom tooth extraction',
                'base_cost' => 8000,
                'duration_minutes' => 60,
            ],
            // Root Canal
            [
                'code' => 'RRC_ANT',
                'name' => 'Anterior Root Canal',
                'category' => 'root_canal',
                'description' => 'Root canal treatment for anterior teeth',
                'base_cost' => 15000,
                'duration_minutes' => 90,
            ],
            [
                'code' => 'RRC_POST',
                'name' => 'Posterior Root Canal',
                'category' => 'root_canal',
                'description' => 'Root canal treatment for posterior teeth',
                'base_cost' => 20000,
                'duration_minutes' => 120,
            ],
            // Crowns
            [
                'code' => 'CRW_PFM',
                'name' => 'PFM Crown',
                'category' => 'crown',
                'description' => 'Porcelain-fused-to-metal crown',
                'base_cost' => 25000,
                'duration_minutes' => 60,
            ],
            [
                'code' => 'CRW_ZIR',
                'name' => 'Zirconia Crown',
                'category' => 'crown',
                'description' => 'Zirconia ceramic crown',
                'base_cost' => 35000,
                'duration_minutes' => 60,
            ],
            [
                'code' => 'CRW_GOLD',
                'name' => 'Gold Crown',
                'category' => 'crown',
                'description' => 'Gold crown',
                'base_cost' => 45000,
                'duration_minutes' => 60,
            ],
            // Bridges
            [
                'code' => 'BRG_3U',
                'name' => '3-Unit Bridge',
                'category' => 'bridge',
                'description' => '3-unit dental bridge',
                'base_cost' => 60000,
                'duration_minutes' => 120,
            ],
            // Dentures
            [
                'code' => 'DEN_PAR',
                'name' => 'Partial Denture',
                'category' => 'denture',
                'description' => 'Removable partial denture',
                'base_cost' => 35000,
                'duration_minutes' => 180,
            ],
            [
                'code' => 'DEN_COM',
                'name' => 'Complete Denture',
                'category' => 'denture',
                'description' => 'Complete removable denture',
                'base_cost' => 50000,
                'duration_minutes' => 240,
            ],
            // Implants
            [
                'code' => 'IMP_STD',
                'name' => 'Standard Implant',
                'category' => 'implant',
                'description' => 'Standard dental implant',
                'base_cost' => 80000,
                'duration_minutes' => 120,
            ],
            // Orthodontics
            [
                'code' => 'ORT_MET',
                'name' => 'Metal Braces',
                'category' => 'orthodontics',
                'description' => 'Traditional metal braces',
                'base_cost' => 120000,
                'duration_minutes' => 60,
            ],
            [
                'code' => 'ORT_CER',
                'name' => 'Ceramic Braces',
                'category' => 'orthodontics',
                'description' => 'Ceramic braces',
                'base_cost' => 150000,
                'duration_minutes' => 60,
            ],
        ];

        foreach ($procedures as $procedure) {
            DentalProcedure::updateOrCreate(
                ['code' => $procedure['code']],
                $procedure
            );
        }
    }
}
