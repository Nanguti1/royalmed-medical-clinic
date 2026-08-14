<?php

namespace App\Console\Commands;

use App\Models\Prescription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendMedicationReminders extends Command
{
    protected $signature = 'medications:send-reminders';

    protected $description = 'Send medication reminders for ongoing prescriptions';

    public function handle(): int
    {
        $recentPrescriptions = Prescription::whereHas('visit', function ($query) {
            $query->where('visit_date', '>=', now()->subDays(7));
        })
            ->whereHas('items')
            ->with(['visit.patient', 'items.medicine'])
            ->get();

        $count = 0;

        foreach ($recentPrescriptions as $prescription) {
            try {
                if ($prescription->isFinalized() && ! $prescription->isFullyDispensed()) {
                    $message = $this->generateReminderMessage($prescription);

                    Log::info("Medication reminder for patient {$prescription->visit->patient->hospital_number}: {$message}");

                    $count++;
                }
            } catch (\Exception $e) {
                Log::error("Failed to send medication reminder: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} medication reminders");

        return Command::SUCCESS;
    }

    private function generateReminderMessage($prescription): string
    {
        $patientName = $prescription->visit->patient->first_name.' '.$prescription->visit->patient->last_name;
        $medications = $prescription->items->pluck('medicine.name')->implode(', ');

        return "Reminder: Please collect your medications from the pharmacy: {$medications}.";
    }
}
