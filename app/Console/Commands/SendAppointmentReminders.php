<?php

namespace App\Console\Commands;

use App\Models\AppointmentReminder;
use App\Services\AppointmentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';

    protected $description = 'Send appointment reminders for upcoming appointments';

    public function handle(): int
    {
        $pendingReminders = AppointmentReminder::where('is_sent', false)
            ->where('scheduled_at', '<=', now())
            ->with(['appointment.patient', 'appointment.doctor'])
            ->get();

        $appointmentService = app(AppointmentService::class);
        $sentCount = 0;
        $failedCount = 0;

        foreach ($pendingReminders as $reminder) {
            try {
                $message = $this->generateReminderMessage($reminder->appointment);

                // Here you would integrate with your SMS/Email notification system
                // For now, we'll mark it as sent
                $reminder->update([
                    'is_sent' => true,
                    'sent_at' => now(),
                    'message' => $message,
                    'status' => 'success',
                ]);

                $sentCount++;
                $this->info("Reminder sent for appointment {$reminder->appointment->appointment_number}");
            } catch (\Exception $e) {
                $reminder->update([
                    'is_sent' => true,
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);

                $failedCount++;
                Log::error("Failed to send appointment reminder: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sentCount} reminders, {$failedCount} failed");

        return Command::SUCCESS;
    }

    private function generateReminderMessage($appointment): string
    {
        $patientName = $appointment->patient->first_name.' '.$appointment->patient->last_name;
        $date = $appointment->appointment_date->format('F j, Y');
        $time = $appointment->start_time;

        return "Reminder: You have an appointment at Royalmed Clinic on {$date} at {$time}. Please arrive 15 minutes early.";
    }
}
