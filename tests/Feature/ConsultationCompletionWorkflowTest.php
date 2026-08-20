<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\VisitService;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ConsultationCompletionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(VisitStatusSeeder::class);

        foreach (['consultations.create', 'consultations.view', 'consultations.update', 'visits.update'] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->user = User::factory()->create();
        $this->user->givePermissionTo([
            'consultations.create',
            'consultations.view',
            'consultations.update',
            'visits.update',
        ]);
    }

    public function test_completing_consultation_transitions_visit_to_waiting_for_prescription_status()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $response = $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertRedirect(route('prescriptions.create', $visit));

        $visit->refresh();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $visit->visit_status_id);
    }

    public function test_consultation_completion_is_logged_in_visit_timeline()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $visit->refresh();
        $timeline = $visit->getTimeline();

        $this->assertTrue(collect($timeline)->contains('action', 'visit.consultation_completed'));
    }

    public function test_consultation_is_removed_from_active_consultation_queue()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        // Create consultation queue entry
        $queueEntry = QueueEntry::create([
            'visit_id' => $visit->id,
            'department' => 'consultation',
            'status' => 'in_progress',
            'priority' => 'normal',
            'queue_number' => 'C001',
            'position' => 1,
        ]);

        $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $queueEntry->refresh();
        $this->assertEquals('completed', $queueEntry->status);
        $this->assertNotNull($queueEntry->completed_at);
    }

    public function test_cancelled_visits_cannot_complete_consultations()
    {
        $visit = Visit::factory()->create(['cancelled_at' => now()]);
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $cancelledStatus = VisitStatus::where('code', 'CANCELLED')->first();
        $visit->update(['visit_status_id' => $cancelledStatus->id]);

        $response = $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertSessionHas('error');
        $visit->refresh();
        $this->assertEquals($cancelledStatus->id, $visit->visit_status_id);
    }

    public function test_completed_visits_cannot_complete_consultations()
    {
        $visit = Visit::factory()->create(['completed_at' => now()]);
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $completedStatus = VisitStatus::where('code', 'VISIT_COMPLETED')->first();
        $visit->update(['visit_status_id' => $completedStatus->id]);

        $response = $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertSessionHas('error');
        $visit->refresh();
        $this->assertEquals($completedStatus->id, $visit->visit_status_id);
    }

    public function test_doctor_is_redirected_to_prescription_creation_after_consultation_completion()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $response = $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertRedirect(route('prescriptions.create', $visit));
        $response->assertSessionHas('success', 'Consultation completed successfully. You can now create a prescription.');
    }

    public function test_visit_service_complete_consultation_handles_state_transitions()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $visitService = app(VisitService::class);
        $updatedVisit = $visitService->completeConsultation($visit);

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $updatedVisit->visit_status_id);
    }

    public function test_visit_get_next_action_shows_create_prescription_for_waiting_for_prescription_status()
    {
        $visit = Visit::factory()->create();

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $nextAction = $visit->getNextAction();

        $this->assertEquals('Create Prescription', $nextAction['label']);
        $this->assertEquals('create_prescription', $nextAction['action']);
        $this->assertEquals('consultations.create', $nextAction['permission']);
    }

    public function test_visit_get_user_facing_status_shows_waiting_for_prescription()
    {
        $visit = Visit::factory()->create();

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $userFacingStatus = $visit->getUserFacingStatus();

        $this->assertEquals('Waiting for Prescription', $userFacingStatus);
    }
}
