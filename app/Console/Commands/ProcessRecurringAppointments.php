<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessRecurringAppointments extends Command
{
    protected $signature = 'appointments:process-recurring';

    protected $description = 'Process recurring appointments and create new instances';

    public function handle(): int
    {
        // Find completed follow-up appointments that should create new follow-ups
        $completedFollowUps = Appointment::where('status', 'completed')
            ->where('is_follow_up', true)
            ->where('updated_at', '>=', now()->subDay())
            ->with(['patient', 'doctor'])
            ->get();

        $count = 0;

        foreach ($completedFollowUps as $appointment) {
            try {
                // This is a placeholder logic - in a real implementation, you would
                // check the consultation for follow-up recommendations and create
                // new appointments based on the recommended timeframe

                Log::info("Processing recurring appointment for patient {$appointment->patient->hospital_number}");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to process recurring appointment: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} recurring appointments");

        return Command::SUCCESS;
    }
}
