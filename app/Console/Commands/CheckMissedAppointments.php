<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class CheckMissedAppointments extends Command
{
    protected $signature = 'appointments:check-missed';

    protected $description = 'Check for missed appointments and send notifications';

    public function handle(): int
    {
        $missedAppointments = Appointment::where('appointment_date', '<', now()->startOfDay())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->with(['patient', 'doctor'])
            ->get();

        $count = 0;

        foreach ($missedAppointments as $appointment) {
            try {
                $appointment->update(['status' => 'no_show']);

                // Send notification to doctor
                if ($appointment->doctor) {
                    // Here you would send a notification to the doctor
                    // For now, we'll just log it
                    Log::info("Missed appointment: {$appointment->appointment_number} for patient {$appointment->patient->hospital_number}");
                }

                $count++;
                $this->info("Marked appointment {$appointment->appointment_number} as no-show");
            } catch (\Exception $e) {
                Log::error("Failed to process missed appointment: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} missed appointments");

        return Command::SUCCESS;
    }
}
