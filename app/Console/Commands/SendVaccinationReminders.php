<?php

namespace App\Console\Commands;

use App\Models\VaccinationReminder;
use App\Services\VaccinationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendVaccinationReminders extends Command
{
    protected $signature = 'vaccinations:send-reminders';

    protected $description = 'Send vaccination reminders for due vaccinations';

    public function handle(): int
    {
        $pendingReminders = VaccinationReminder::where('is_sent', false)
            ->where('scheduled_at', '<=', now())
            ->with(['patient', 'vaccinationRecord.vaccine'])
            ->get();

        $vaccinationService = app(VaccinationService::class);
        $sentCount = 0;
        $failedCount = 0;

        foreach ($pendingReminders as $reminder) {
            try {
                $message = $this->generateReminderMessage($reminder);

                $vaccinationService->sendReminder($reminder, $message);

                $sentCount++;
                $this->info("Vaccination reminder sent for patient {$reminder->patient->hospital_number}");
            } catch (\Exception $e) {
                $reminder->update([
                    'is_sent' => true,
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);

                $failedCount++;
                Log::error("Failed to send vaccination reminder: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sentCount} vaccination reminders, {$failedCount} failed");

        return Command::SUCCESS;
    }

    private function generateReminderMessage($reminder): string
    {
        $patientName = $reminder->patient->first_name.' '.$reminder->patient->last_name;
        $vaccineName = $reminder->vaccinationRecord->vaccine->name;
        $dueDate = $reminder->due_date->format('F j, Y');

        return "Reminder: Your child is due for the {$vaccineName} vaccine on {$dueDate}. Please visit Royalmed Clinic.";
    }
}
