<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentReminder;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\PatientCoverage;
use App\Models\Prescription;
use App\Models\VaccinationReminder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AutomationService
{
    public function sendAppointmentReminders(): int
    {
        $reminders = AppointmentReminder::pending()
            ->with(['appointment.patient', 'appointment.doctor'])
            ->get();

        $sent = 0;

        foreach ($reminders as $reminder) {
            try {
                $message = $this->generateAppointmentReminderMessage($reminder->appointment);
                $reminder->message = $message;
                $reminder->markAsSent('success');
                $sent++;
            } catch (\Exception $e) {
                Log::error('Failed to send appointment reminder', [
                    'reminder_id' => $reminder->id,
                    'error' => $e->getMessage(),
                ]);
                $reminder->markAsFailed($e->getMessage());
            }
        }

        return $sent;
    }

    public function checkMissedAppointments(): int
    {
        $missed = Appointment::scheduled()
            ->where('appointment_date', '<', now()->subHours(1))
            ->where('start_time', '<', now()->subHours(1))
            ->where('checked_in_at', null)
            ->get();

        $count = 0;

        foreach ($missed as $appointment) {
            try {
                $appointment->markAsNoShow();
                $count++;
            } catch (\Exception $e) {
                Log::error('Failed to mark appointment as no-show', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    public function sendVaccinationReminders(): int
    {
        $reminders = VaccinationReminder::pending()
            ->with(['patient', 'vaccinationRecord.vaccine'])
            ->get();

        $sent = 0;

        foreach ($reminders as $reminder) {
            try {
                $message = $this->generateVaccinationReminderMessage($reminder);
                $reminder->message = $message;
                $reminder->markAsSent('success');
                $sent++;
            } catch (\Exception $e) {
                Log::error('Failed to send vaccination reminder', [
                    'reminder_id' => $reminder->id,
                    'error' => $e->getMessage(),
                ]);
                $reminder->markAsFailed($e->getMessage());
            }
        }

        return $sent;
    }

    public function checkPrescriptionExpiry(): int
    {
        $expiringPrescriptions = Prescription::where('status', 'active')
            ->where('expiry_date', '<=', now()->addDays(7))
            ->where('expiry_date', '>=', now())
            ->get();

        $count = 0;

        foreach ($expiringPrescriptions as $prescription) {
            try {
                $this->notifyPrescriptionExpiry($prescription);
                $count++;
            } catch (\Exception $e) {
                Log::error('Failed to notify prescription expiry', [
                    'prescription_id' => $prescription->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    public function checkLowStock(): int
    {
        $lowStockItems = InventoryItem::where('current_quantity', '<=', \DB::raw('reorder_level'))
            ->where('current_quantity', '>', 0)
            ->get();

        $count = 0;

        foreach ($lowStockItems as $item) {
            try {
                $this->notifyLowStock($item);
                $count++;
            } catch (\Exception $e) {
                Log::error('Failed to notify low stock', [
                    'item_id' => $item->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    public function checkExpiringStock(): int
    {
        $expiringItems = InventoryItem::where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>=', now())
            ->where('current_quantity', '>', 0)
            ->get();

        $count = 0;

        foreach ($expiringItems as $item) {
            try {
                $this->notifyExpiringStock($item);
                $count++;
            } catch (\Exception $e) {
                Log::error('Failed to notify expiring stock', [
                    'item_id' => $item->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    public function checkInsuranceExpiry(): int
    {
        $expiringCoverages = PatientCoverage::active()
            ->where('effective_to', '<=', now()->addDays(30))
            ->where('effective_to', '>=', now())
            ->get();

        $count = 0;

        foreach ($expiringCoverages as $coverage) {
            try {
                $this->notifyInsuranceExpiry($coverage);
                $count++;
            } catch (\Exception $e) {
                Log::error('Failed to notify insurance expiry', [
                    'coverage_id' => $coverage->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    public function processBillingNotifications(): int
    {
        $pendingPayments = Invoice::whereHas('status', fn ($q) => $q->where('code', 'unpaid'))
            ->where('due_date', '<=', now()->addDays(3))
            ->where('due_date', '>=', now())
            ->get();

        $count = 0;

        foreach ($pendingPayments as $invoice) {
            try {
                $this->notifyPendingPayment($invoice);
                $count++;
            } catch (\Exception $e) {
                Log::error('Failed to notify pending payment', [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    public function generateAppointmentReminderMessage(Appointment $appointment): string
    {
        $patient = $appointment->patient;
        $doctor = $appointment->doctor;
        $date = $appointment->appointment_date->format('l, F j, Y');
        $time = Carbon::parse($appointment->start_time)->format('g:i A');

        return "Reminder: You have an appointment at Royalmed Clinic on {$date} at {$time}. Doctor: {$doctor->name}. Please arrive 15 minutes early.";
    }

    public function generateVaccinationReminderMessage(VaccinationReminder $reminder): string
    {
        $patient = $reminder->patient;
        $vaccine = $reminder->vaccinationRecord->vaccine;
        $dueDate = $reminder->due_date->format('F j, Y');

        return "Vaccination Reminder: Your {$vaccine->name} vaccine is due on {$dueDate}. Please visit Royalmed Clinic to complete your vaccination schedule.";
    }

    private function notifyPrescriptionExpiry(Prescription $prescription): void
    {
        Log::info('Prescription expiry notification', [
            'prescription_id' => $prescription->id,
            'patient_id' => $prescription->patient_id,
            'expiry_date' => $prescription->expiry_date,
        ]);
    }

    private function notifyLowStock(InventoryItem $item): void
    {
        Log::info('Low stock notification', [
            'item_id' => $item->id,
            'item_name' => $item->name,
            'current_quantity' => $item->current_quantity,
            'reorder_level' => $item->reorder_level,
        ]);
    }

    private function notifyExpiringStock(InventoryItem $item): void
    {
        Log::info('Expiring stock notification', [
            'item_id' => $item->id,
            'item_name' => $item->name,
            'expiry_date' => $item->expiry_date,
            'quantity' => $item->current_quantity,
        ]);
    }

    private function notifyInsuranceExpiry(PatientCoverage $coverage): void
    {
        Log::info('Insurance expiry notification', [
            'coverage_id' => $coverage->id,
            'patient_id' => $coverage->patient_id,
            'effective_to' => $coverage->effective_to,
        ]);
    }

    private function notifyPendingPayment(Invoice $invoice): void
    {
        Log::info('Pending payment notification', [
            'invoice_id' => $invoice->id,
            'patient_id' => $invoice->patient_id,
            'due_date' => $invoice->due_date,
            'amount' => $invoice->total_amount,
        ]);
    }
}
