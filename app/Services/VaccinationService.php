<?php

namespace App\Services;

use App\Models\VaccinationCertificate;
use App\Models\VaccinationRecord;
use App\Models\VaccinationReminder;
use App\Models\Vaccine;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VaccinationService
{
    public function recordVaccination(array $data): VaccinationRecord
    {
        return DB::transaction(function () use ($data) {
            $record = VaccinationRecord::create([
                'patient_id' => $data['patient_id'],
                'vaccine_id' => $data['vaccine_id'],
                'visit_id' => $data['visit_id'] ?? null,
                'administered_by' => $data['administered_by'] ?? auth()->id(),
                'administration_date' => $data['administration_date'] ?? now(),
                'dose_number' => $data['dose_number'] ?? 1,
                'batch_number' => $data['batch_number'] ?? null,
                'expiry_date' => $data['expiry_date'] ?? null,
                'site' => $data['site'] ?? 'left_arm',
                'route' => $data['route'] ?? 'intramuscular',
                'dosage' => $data['dosage'] ?? null,
                'dosage_unit' => $data['dosage_unit'] ?? null,
                'reactions' => $data['reactions'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'administered',
            ]);

            $vaccine = $record->vaccine;
            if ($vaccine && $vaccine->interval_days && $data['dose_number'] < $vaccine->doses_required) {
                $nextDueDate = $record->calculateNextDueDate();
                if ($nextDueDate) {
                    $record->next_due_date = $nextDueDate;
                    $record->save();

                    $this->scheduleReminder($record, $nextDueDate);
                }
            }

            return $record;
        });
    }

    public function scheduleReminder(VaccinationRecord $record, Carbon $dueDate): VaccinationReminder
    {
        $reminderTime = $dueDate->subDays(7);

        return $record->reminders()->create([
            'patient_id' => $record->patient_id,
            'due_date' => $dueDate,
            'reminder_type' => 'sms',
            'is_sent' => false,
            'scheduled_at' => $reminderTime,
        ]);
    }

    public function issueCertificate(VaccinationRecord $record, array $data): VaccinationCertificate
    {
        return VaccinationCertificate::create([
            'patient_id' => $record->patient_id,
            'vaccination_record_id' => $record->id,
            'valid_from' => $data['valid_from'] ?? now(),
            'valid_until' => $data['valid_until'] ?? null,
            'issuing_authority' => $data['issuing_authority'] ?? 'Royalmed Clinic',
            'issuer_name' => $data['issuer_name'] ?? null,
            'issuer_license' => $data['issuer_license'] ?? null,
            'file_path' => $data['file_path'] ?? null,
            'file_name' => $data['file_name'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }

    public function getPatientVaccinationHistory(int $patientId)
    {
        return VaccinationRecord::byPatient($patientId)
            ->with('vaccine')
            ->orderBy('administration_date', 'desc')
            ->get();
    }

    public function getDueVaccinations(int $patientId)
    {
        return VaccinationRecord::byPatient($patientId)
            ->due()
            ->with('vaccine')
            ->orderBy('next_due_date')
            ->get();
    }

    public function getOverdueVaccinations(int $patientId)
    {
        return VaccinationRecord::byPatient($patientId)
            ->overdue()
            ->with('vaccine')
            ->orderBy('next_due_date')
            ->get();
    }

    public function getVaccinationSchedule(int $patientAgeMonths)
    {
        return Vaccine::active()
            ->where(function ($query) use ($patientAgeMonths) {
                $query->whereNull('min_age_months')
                    ->orWhere('min_age_months', '<=', $patientAgeMonths);
            })
            ->where(function ($query) use ($patientAgeMonths) {
                $query->whereNull('max_age_months')
                    ->orWhere('max_age_months', '>=', $patientAgeMonths);
            })
            ->orderBy('doses_required')
            ->get();
    }

    public function getPendingReminders()
    {
        return VaccinationReminder::pending()
            ->with(['patient', 'vaccinationRecord.vaccine'])
            ->orderBy('scheduled_at')
            ->get();
    }

    public function sendReminder(VaccinationReminder $reminder, string $message): void
    {
        try {
            $reminder->message = $message;
            $reminder->markAsSent('success');
        } catch (\Exception $e) {
            $reminder->markAsFailed($e->getMessage());
        }
    }

    public function revokeCertificate(VaccinationCertificate $certificate, string $reason): void
    {
        $certificate->revoke($reason);
    }

    public function deferVaccination(VaccinationRecord $record): void
    {
        $record->defer();
    }

    public function markAsContraindicated(VaccinationRecord $record): void
    {
        $record->markAsContraindicated();
    }
}
