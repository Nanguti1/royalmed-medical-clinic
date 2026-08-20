<?php

namespace Database\Seeders;

use App\Models\VisitStatus;
use Illuminate\Database\Seeder;

class VisitStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['code' => 'REGISTERED', 'name' => 'Registered'],
            ['code' => 'WAITING_FOR_TRIAGE', 'name' => 'Waiting For Triage'],
            ['code' => 'TRIAGE_IN_PROGRESS', 'name' => 'Triage In Progress'],
            ['code' => 'WAITING_FOR_CONSULTATION', 'name' => 'Waiting For Consultation'],
            ['code' => 'CONSULTATION_IN_PROGRESS', 'name' => 'Consultation In Progress'],
            ['code' => 'WAITING_FOR_LAB', 'name' => 'Waiting For Lab'],
            ['code' => 'LAB_IN_PROGRESS', 'name' => 'Lab In Progress'],
            ['code' => 'LAB_RESULTS_READY', 'name' => 'Lab Results Ready'],
            ['code' => 'WAITING_FOR_PHARMACY', 'name' => 'Waiting For Pharmacy'],
            ['code' => 'WAITING_FOR_BILLING', 'name' => 'Waiting For Billing'],
            ['code' => 'PAID', 'name' => 'Paid'],
            ['code' => 'VISIT_COMPLETED', 'name' => 'Visit Completed'],
            ['code' => 'CANCELLED', 'name' => 'Cancelled'],
        ];

        foreach ($statuses as $status) {
            VisitStatus::firstOrCreate(
                ['code' => $status['code']],
                ['name' => $status['name']]
            );
        }
    }
}
