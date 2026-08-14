<?php

namespace App\Console\Commands;

use App\Models\PatientCoverage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckInsuranceExpiry extends Command
{
    protected $signature = 'insurance:check-expiry';

    protected $description = 'Check for expiring insurance coverage and send alerts';

    public function handle(): int
    {
        $expiringSoon = PatientCoverage::where('effective_to', '<=', now()->addDays(30))
            ->where('effective_to', '>', now())
            ->where('is_active', true)
            ->with(['patient', 'scheme'])
            ->get();

        $expired = PatientCoverage::where('effective_to', '<=', now())
            ->where('is_active', true)
            ->with(['patient', 'scheme'])
            ->get();

        $count = 0;

        foreach ($expiringSoon as $coverage) {
            try {
                $daysUntilExpiry = $coverage->effective_to->diffInDays(now());
                Log::warning("Insurance expiring soon: Patient {$coverage->patient->hospital_number} - {$coverage->scheme->name} expires in {$daysUntilExpiry} days");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send insurance expiry alert: {$e->getMessage()}");
            }
        }

        foreach ($expired as $coverage) {
            try {
                $coverage->update(['is_active' => false]);
                Log::error("Insurance expired: Patient {$coverage->patient->hospital_number} - {$coverage->scheme->name} expired on {$coverage->effective_to}");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to process expired insurance: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} insurance expiry alerts");

        return Command::SUCCESS;
    }
}
