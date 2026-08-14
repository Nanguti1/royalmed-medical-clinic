<?php

namespace Tests\Feature;

use App\Exceptions\InvalidQueueStateException;
use App\Models\User;
use App\Models\Visit;
use App\Services\QueueService;
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
