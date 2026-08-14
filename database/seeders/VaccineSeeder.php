<?php

namespace Database\Seeders;

use App\Models\Vaccine;
use Illuminate\Database\Seeder;

class VaccineSeeder extends Seeder
{
    public function run(): void
    {
        $vaccines = [
            [
                'code' => 'BCG',
                'name' => 'BCG Vaccine',
                'description' => 'Bacillus Calmette-Guérin vaccine for tuberculosis',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'intramuscular',
                'target_diseases' => ['tuberculosis'],
                'doses_required' => 1,
                'min_age_months' => 0,
                'max_age_months' => 1,
                'interval_days' => null,
            ],
            [
                'code' => 'OPV',
                'name' => 'Oral Polio Vaccine',
                'description' => 'Oral polio vaccine',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'oral',
                'target_diseases' => ['polio'],
                'doses_required' => 4,
                'min_age_months' => 0,
                'max_age_months' => 60,
                'interval_days' => 28,
            ],
            [
                'code' => 'DPT',
                'name' => 'DPT Vaccine',
                'description' => 'Diphtheria, Pertussis, Tetanus vaccine',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'intramuscular',
                'target_diseases' => ['diphtheria', 'pertussis', 'tetanus'],
                'doses_required' => 3,
                'min_age_months' => 2,
                'max_age_months' => 60,
                'interval_days' => 28,
            ],
            [
                'code' => 'HEP_B',
                'name' => 'Hepatitis B Vaccine',
                'description' => 'Hepatitis B vaccine',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'intramuscular',
                'target_diseases' => ['hepatitis_b'],
                'doses_required' => 3,
                'min_age_months' => 0,
                'max_age_months' => 180,
                'interval_days' => 28,
            ],
            [
                'code' => 'HIB',
                'name' => 'Hib Vaccine',
                'description' => 'Haemophilus influenzae type b vaccine',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'intramuscular',
                'target_diseases' => ['haemophilus_influenzae'],
                'doses_required' => 3,
                'min_age_months' => 2,
                'max_age_months' => 60,
                'interval_days' => 28,
            ],
            [
                'code' => 'MMR',
                'name' => 'MMR Vaccine',
                'description' => 'Measles, Mumps, Rubella vaccine',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'subcutaneous',
                'target_diseases' => ['measles', 'mumps', 'rubella'],
                'doses_required' => 2,
                'min_age_months' => 9,
                'max_age_months' => 180,
                'interval_days' => 90,
            ],
            [
                'code' => 'PCV',
                'name' => 'Pneumococcal Vaccine',
                'description' => 'Pneumococcal conjugate vaccine',
                'manufacturer' => 'Pfizer',
                'route' => 'intramuscular',
                'target_diseases' => ['pneumonia', 'meningitis'],
                'doses_required' => 3,
                'min_age_months' => 2,
                'max_age_months' => 60,
                'interval_days' => 28,
            ],
            [
                'code' => 'ROT',
                'name' => 'Rotavirus Vaccine',
                'description' => 'Rotavirus vaccine',
                'manufacturer' => 'GlaxoSmithKline',
                'route' => 'oral',
                'target_diseases' => ['rotavirus'],
                'doses_required' => 2,
                'min_age_months' => 2,
                'max_age_months' => 24,
                'interval_days' => 28,
            ],
            [
                'code' => 'TET',
                'name' => 'Tetanus Toxoid',
                'description' => 'Tetanus toxoid vaccine',
                'manufacturer' => 'Serum Institute of India',
                'route' => 'intramuscular',
                'target_diseases' => ['tetanus'],
                'doses_required' => 1,
                'min_age_months' => 0,
                'max_age_months' => null,
                'interval_days' => null,
            ],
            [
                'code' => 'INFLUENZA',
                'name' => 'Influenza Vaccine',
                'description' => 'Seasonal influenza vaccine',
                'manufacturer' => 'Sanofi',
                'route' => 'intramuscular',
                'target_diseases' => ['influenza'],
                'doses_required' => 1,
                'min_age_months' => 6,
                'max_age_months' => null,
                'interval_days' => null,
            ],
            [
                'code' => 'COVID',
                'name' => 'COVID-19 Vaccine',
                'description' => 'COVID-19 vaccine',
                'manufacturer' => 'AstraZeneca',
                'route' => 'intramuscular',
                'target_diseases' => ['covid_19'],
                'doses_required' => 2,
                'min_age_months' => 12,
                'max_age_months' => null,
                'interval_days' => 84,
            ],
        ];

        foreach ($vaccines as $vaccine) {
            Vaccine::updateOrCreate(
                ['code' => $vaccine['code']],
                $vaccine
            );
        }
    }
}
