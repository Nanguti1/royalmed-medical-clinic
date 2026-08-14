<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\VaccinationCertificate;
use App\Models\VaccinationRecord;
use App\Models\VaccinationReminder;
use App\Models\Vaccine;
use App\Services\VaccinationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VaccinationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected VaccinationService $vaccinationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->vaccinationService = app(VaccinationService::class);
    }

    public function test_vaccination_can_be_recorded(): void
    {
        $patient = Patient::factory()->create();
        $vaccine = Vaccine::factory()->create(['doses_required' => 2, 'interval_days' => 28]);

        $record = $this->vaccinationService->recordVaccination([
            'patient_id' => $patient->id,
            'vaccine_id' => $vaccine->id,
            'dose_number' => 1,
            'batch_number' => 'ABC123456',
            'site' => 'left_arm',
        ]);

        $this->assertDatabaseHas('vaccination_records', [
            'patient_id' => $patient->id,
            'vaccine_id' => $vaccine->id,
            'dose_number' => 1,
            'status' => 'administered',
        ]);

        $this->assertNotNull($record->next_due_date);
    }

    public function test_vaccination_reminder_is_scheduled(): void
    {
        $record = VaccinationRecord::factory()->create([
            'next_due_date' => now()->addDays(7),
        ]);

        $reminder = $this->vaccinationService->scheduleReminder($record, $record->next_due_date);

        $this->assertDatabaseHas('vaccination_reminders', [
            'vaccination_record_id' => $record->id,
            'is_sent' => false,
        ]);
    }

    public function test_certificate_can_be_issued(): void
    {
        $record = VaccinationRecord::factory()->create();

        $certificate = $this->vaccinationService->issueCertificate($record, [
            'valid_from' => now(),
            'valid_until' => now()->addYears(5),
        ]);

        $this->assertDatabaseHas('vaccination_certificates', [
            'patient_id' => $record->patient_id,
            'vaccination_record_id' => $record->id,
            'status' => 'issued',
        ]);
    }

    public function test_vaccination_history_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        VaccinationRecord::factory()->count(3)->create(['patient_id' => $patient->id]);

        $history = $this->vaccinationService->getPatientVaccinationHistory($patient->id);

        $this->assertCount(3, $history);
    }

    public function test_due_vaccinations_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        VaccinationRecord::factory()->create([
            'patient_id' => $patient->id,
            'next_due_date' => now()->addDays(7),
            'status' => 'administered',
        ]);

        $due = $this->vaccinationService->getDueVaccinations($patient->id);

        $this->assertCount(1, $due);
    }

    public function test_overdue_vaccinations_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        VaccinationRecord::factory()->create([
            'patient_id' => $patient->id,
            'next_due_date' => now()->subDays(7),
            'status' => 'administered',
        ]);

        $overdue = $this->vaccinationService->getOverdueVaccinations($patient->id);

        $this->assertCount(1, $overdue);
    }

    public function test_vaccination_can_be_deferred(): void
    {
        $record = VaccinationRecord::factory()->create(['status' => 'administered']);

        $this->vaccinationService->deferVaccination($record);

        $this->assertEquals('deferred', $record->fresh()->status);
    }

    public function test_vaccination_can_be_marked_as_contraindicated(): void
    {
        $record = VaccinationRecord::factory()->create(['status' => 'administered']);

        $this->vaccinationService->markAsContraindicated($record);

        $this->assertEquals('contraindicated', $record->fresh()->status);
    }

    public function test_certificate_can_be_revoked(): void
    {
        $certificate = VaccinationCertificate::factory()->create(['status' => 'issued']);

        $this->vaccinationService->revokeCertificate($certificate, 'Admin error');

        $this->assertEquals('revoked', $certificate->fresh()->status);
        $this->assertEquals('Admin error', $certificate->fresh()->revocation_reason);
    }

    public function test_vaccine_is_applicable_for_age(): void
    {
        $vaccine = Vaccine::factory()->create([
            'min_age_months' => 6,
            'max_age_months' => 24,
        ]);

        $this->assertTrue($vaccine->isApplicableForAge(12));
        $this->assertFalse($vaccine->isApplicableForAge(3));
        $this->assertFalse($vaccine->isApplicableForAge(36));
    }

    public function test_vaccine_prevents_disease(): void
    {
        $vaccine = Vaccine::factory()->create([
            'target_diseases' => ['measles', 'mumps', 'rubella'],
        ]);

        $this->assertTrue($vaccine->preventsDisease('measles'));
        $this->assertFalse($vaccine->preventsDisease('polio'));
    }

    public function test_reminder_can_be_marked_as_sent(): void
    {
        $reminder = VaccinationReminder::factory()->create(['is_sent' => false]);

        $reminder->markAsSent('success');

        $this->assertTrue($reminder->is_sent);
        $this->assertEquals('success', $reminder->status);
    }

    public function test_reminder_can_be_marked_as_failed(): void
    {
        $reminder = VaccinationReminder::factory()->create(['is_sent' => false]);

        $reminder->markAsFailed('Network error');

        $this->assertTrue($reminder->is_sent);
        $this->assertEquals('failed', $reminder->status);
        $this->assertEquals('Network error', $reminder->error_message);
    }

    public function test_next_due_date_is_calculated(): void
    {
        $vaccine = Vaccine::factory()->create(['interval_days' => 28]);
        $record = VaccinationRecord::factory()->create([
            'vaccine_id' => $vaccine->id,
            'administration_date' => now()->subDays(28),
        ]);

        $nextDue = $record->calculateNextDueDate();

        $this->assertNotNull($nextDue);
        $this->assertEquals(now()->toDateString(), $nextDue->toDateString());
    }
}
