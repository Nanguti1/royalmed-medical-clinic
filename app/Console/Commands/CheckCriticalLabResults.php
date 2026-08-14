<?php

namespace App\Console\Commands;

use App\Models\LabResult;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckCriticalLabResults extends Command
{
    protected $signature = 'laboratory:check-critical-results';

    protected $description = 'Check for critical lab results and send alerts';

    public function handle(): int
    {
        $criticalResults = LabResult::where('is_critical', true)
            ->where('verification_status', 'verified')
            ->with(['orderItem.order.visit.patient', 'test'])
            ->get();

        $count = 0;

        foreach ($criticalResults as $result) {
            try {
                $patient = $result->orderItem->order->visit->patient;
                $testName = $result->test->name;

                Log::error("CRITICAL LAB RESULT: Patient {$patient->hospital_number} - {$testName} - Value: {$result->result_value} (Reference: {$result->reference_range})");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send critical lab result alert: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} critical lab result alerts");

        return Command::SUCCESS;
    }
}
