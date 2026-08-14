<?php

namespace Database\Seeders;

use App\Models\RetentionSchedule;
use Illuminate\Database\Seeder;

class RetentionScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $schedules = [
            [
                'record_type' => 'patient_records',
                'retention_period' => '25_years',
                'description' => 'Patient medical records retained for 25 years as per medical council regulations',
                'is_active' => true,
            ],
            [
                'record_type' => 'lab_results',
                'retention_period' => '10_years',
                'description' => 'Laboratory results retained for 10 years',
                'is_active' => true,
            ],
            [
                'record_type' => 'prescriptions',
                'retention_period' => '10_years',
                'description' => 'Prescription records retained for 10 years',
                'is_active' => true,
            ],
            [
                'record_type' => 'billing',
                'retention_period' => '7_years',
                'description' => 'Billing and financial records retained for 7 years per tax regulations',
                'is_active' => true,
            ],
            [
                'record_type' => 'documents',
                'retention_period' => '10_years',
                'description' => 'Patient documents retained for 10 years',
                'is_active' => true,
            ],
        ];

        foreach ($schedules as $schedule) {
            RetentionSchedule::updateOrCreate(
                ['record_type' => $schedule['record_type']],
                array_merge($schedule, [
                    'created_by' => 1,
                ])
            );
        }
    }
}
