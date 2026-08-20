<?php

namespace Tests\Feature;

use App\Exceptions\InvalidQueueStateException;
use App\Models\Patient;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\QueueService;
use App\Services\VisitService;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class TriageQueueVisitFlowWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['visits.view', 'visits.create', 'visits.update'] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->user = User::factory()->create();
        $this->user->givePermissionTo(['visits.view', 'visits.create', 'visits.update']);

        // Seed visit statuses
        $this->seed(VisitStatusSeeder::class);
    }

    public function test_visit_creation_creates_triage_queue_work(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Check visit status is WAITING_FOR_TRIAGE
        $waitingForTriageStatus = VisitStatus::where('code', 'WAITING_FOR_TRIAGE')->first();
        $this->assertNotNull($waitingForTriageStatus);
        $this->assertEquals($waitingForTriageStatus->id, $visit->visit_status_id);

        // Check triage queue entry was created
        $triageQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'triage')
            ->first();

        $this->assertNotNull($triageQueueEntry);
        $this->assertEquals('waiting', $triageQueueEntry->status);
        $this->assertEquals('triage', $triageQueueEntry->department);
    }

    public function test_triage_start_sets_status_to_in_progress(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Start triage
        $visitService->startTriage($visit);

        // Check visit status is TRIAGE_IN_PROGRESS
        $triageInProgressStatus = VisitStatus::where('code', 'TRIAGE_IN_PROGRESS')->first();
        $this->assertNotNull($triageInProgressStatus);
        $this->assertEquals($triageInProgressStatus->id, $visit->fresh()->visit_status_id);

        // Check triage queue entry is in_progress
        $triageQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'triage')
            ->first();

        $this->assertNotNull($triageQueueEntry);
        $this->assertEquals('in_progress', $triageQueueEntry->status);
        $this->assertNotNull($triageQueueEntry->started_at);
    }

    public function test_triage_completion_removes_active_triage_queue_work(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Start and complete triage
        $visitService->startTriage($visit);
        $visitService->completeTriage($visit);

        // Check visit status is WAITING_FOR_CONSULTATION
        $waitingForConsultationStatus = VisitStatus::where('code', 'WAITING_FOR_CONSULTATION')->first();
        $this->assertNotNull($waitingForConsultationStatus);
        $this->assertEquals($waitingForConsultationStatus->id, $visit->fresh()->visit_status_id);

        // Check triage queue entry is completed
        $triageQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'triage')
            ->first();

        $this->assertNotNull($triageQueueEntry);
        $this->assertEquals('completed', $triageQueueEntry->status);
        $this->assertNotNull($triageQueueEntry->completed_at);

        // Check visit is no longer in active triage queue
        $activeTriageEntries = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'triage')
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->get();

        $this->assertCount(0, $activeTriageEntries);
    }

    public function test_triage_completion_creates_consultation_queue_work(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Start and complete triage
        $visitService->startTriage($visit);
        $visitService->completeTriage($visit);

        // Check consultation queue entry was created
        $consultationQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'consultation')
            ->first();

        $this->assertNotNull($consultationQueueEntry);
        $this->assertEquals('waiting', $consultationQueueEntry->status);
        $this->assertEquals('consultation', $consultationQueueEntry->department);
    }

    public function test_cancelled_visits_cannot_be_queued(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);
        $queueService = app(QueueService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Cancel the visit
        $visitService->cancel($visit);

        // Try to add to queue - should throw exception
        $this->expectException(InvalidQueueStateException::class);

        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
        ]);
    }

    public function test_completed_visits_cannot_be_queued(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);
        $queueService = app(QueueService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Complete the visit
        $visitService->start($visit);
        $visitService->complete($visit);

        // Try to add to queue - should throw exception
        $this->expectException(InvalidQueueStateException::class);

        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
        ]);
    }

    public function test_double_submit_triage_does_not_create_duplicate_consultation_queue_items(): void
    {
        $patient = Patient::factory()->create();
        $visitService = app(VisitService::class);

        $visit = $visitService->create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Start and complete triage
        $visitService->startTriage($visit);
        $visitService->completeTriage($visit);

        // Try to complete triage again
        $visitService->completeTriage($visit);

        // Check only one consultation queue entry exists
        $consultationQueueEntries = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'consultation')
            ->get();

        $this->assertCount(1, $consultationQueueEntries);
    }

    public function test_triage_capture_stores_all_fields_and_calculates_bmi_and_news(): void
    {
        $visit = Visit::factory()->create();

        $response = $this->actingAs($this->user)->post(route('visits.captureVitals', $visit), [
            'visit_id' => $visit->id,
            'temperature_c' => 39.5,
            'pulse' => 115,
            'respiratory_rate' => 22,
            'oxygen_saturation' => 90.0,
            'blood_pressure' => '85/50',
            'height_cm' => 170,
            'weight_kg' => 68,
            'pain_score' => 6,
            'chief_complaint' => 'High fever and shortness of breath',
            'nurse_notes' => 'Patient looks acutely ill at triage.',
        ]);

        $response->assertRedirect(route('visits.show', $visit));

        $vitals = $visit->fresh()->vitalSign;
        $this->assertNotNull($vitals);

        // BMI calculation: 68 / (1.70 * 1.70) = 23.53
        $this->assertSame('23.53', (string) $vitals->bmi);

        // NEWS calculation:
        // Temp 39.5 => +2
        // HR 115 => +2
        // RR 22 => +2
        // SpO2 90 => +3
        // SBP 85 => +3
        // Total = 12
        $this->assertSame(12, $vitals->news_score);
        $this->assertSame('High fever and shortness of breath', $vitals->chief_complaint);
    }

    public function test_queue_entries_can_be_created_per_department_for_same_visit(): void
    {
        $visit = Visit::factory()->create();
        $queueService = app(QueueService::class);

        $triageEntry = $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'triage',
        ]);

        // Complete triage entry
        $queueService->serve($triageEntry);

        $consultEntry = $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
        ]);

        $labEntry = $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'laboratory',
        ]);

        $this->assertSame('triage', $triageEntry->department);
        $this->assertSame('consultation', $consultEntry->department);
        $this->assertSame('laboratory', $labEntry->department);

        $this->assertNotSame($triageEntry->queue_number, $consultEntry->queue_number);
        $this->assertNotSame($consultEntry->queue_number, $labEntry->queue_number);
    }

    public function test_duplicate_active_entries_in_same_department_are_rejected(): void
    {
        $visit = Visit::factory()->create();
        $queueService = app(QueueService::class);

        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
        ]);

        $this->expectException(InvalidQueueStateException::class);

        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
        ]);
    }

    public function test_priority_ordering_is_respected(): void
    {
        $visitNormal = Visit::factory()->create();
        $visitEmergency = Visit::factory()->create();
        $visitUrgent = Visit::factory()->create();

        $queueService = app(QueueService::class);

        $normalEntry = $queueService->add([
            'visit_id' => $visitNormal->id,
            'department' => 'consultation',
            'priority' => 'normal',
        ]);

        $emergencyEntry = $queueService->add([
            'visit_id' => $visitEmergency->id,
            'department' => 'consultation',
            'priority' => 'emergency',
        ]);

        $urgentEntry = $queueService->add([
            'visit_id' => $visitUrgent->id,
            'department' => 'consultation',
            'priority' => 'urgent',
        ]);

        $worklist = $queueService->getWorklist('consultation');

        $this->assertCount(3, $worklist);
        $this->assertSame($emergencyEntry->id, $worklist[0]->id);
        $this->assertSame($urgentEntry->id, $worklist[1]->id);
        $this->assertSame($normalEntry->id, $worklist[2]->id);
    }
}
