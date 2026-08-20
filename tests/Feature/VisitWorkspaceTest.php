<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\ConsultationService;
use App\Services\VisitService;
use Database\Seeders\AuthorizationSeeder;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed visit statuses
        $this->seed(VisitStatusSeeder::class);

        // Seed permissions
        $this->seed(AuthorizationSeeder::class);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_triage_states(): void
    {
        $visit = Visit::factory()->create();

        // Test REGISTERED state
        $registeredStatus = VisitStatus::where('code', 'REGISTERED')->first();
        $visit->update(['visit_status_id' => $registeredStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Start Triage', $nextAction['label']);
        $this->assertEquals('triage', $nextAction['action']);
        $this->assertEquals('visits.update', $nextAction['permission']);

        // Test WAITING_FOR_TRIAGE state
        $waitingForTriageStatus = VisitStatus::where('code', 'WAITING_FOR_TRIAGE')->first();
        $visit->update(['visit_status_id' => $waitingForTriageStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Start Triage', $nextAction['label']);
        $this->assertEquals('triage', $nextAction['action']);

        // Test TRIAGE_IN_PROGRESS state
        $triageInProgressStatus = VisitStatus::where('code', 'TRIAGE_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $triageInProgressStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Complete Triage', $nextAction['label']);
        $this->assertEquals('complete_triage', $nextAction['action']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_consultation_states(): void
    {
        $visit = Visit::factory()->create();

        // Test WAITING_FOR_CONSULTATION state
        $waitingForConsultationStatus = VisitStatus::where('code', 'WAITING_FOR_CONSULTATION')->first();
        $visit->update(['visit_status_id' => $waitingForConsultationStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Start Consultation', $nextAction['label']);
        $this->assertEquals('start_consultation', $nextAction['action']);
        $this->assertEquals('consultations.create', $nextAction['permission']);

        // Test CONSULTATION_IN_PROGRESS state
        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Complete Consultation', $nextAction['label']);
        $this->assertEquals('complete_consultation', $nextAction['action']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_lab_states(): void
    {
        $visit = Visit::factory()->create();

        // Test WAITING_FOR_LAB state
        $waitingForLabStatus = VisitStatus::where('code', 'WAITING_FOR_LAB')->first();
        $visit->update(['visit_status_id' => $waitingForLabStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Process Lab Order', $nextAction['label']);
        $this->assertEquals('process_lab', $nextAction['action']);
        $this->assertEquals('lab_orders.update', $nextAction['permission']);

        // Test LAB_IN_PROGRESS state
        $labInProgressStatus = VisitStatus::where('code', 'LAB_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $labInProgressStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Complete Lab Processing', $nextAction['label']);
        $this->assertEquals('complete_lab', $nextAction['action']);

        // Test LAB_RESULTS_READY state - should show Continue Consultation
        $labResultsReadyStatus = VisitStatus::where('code', 'LAB_RESULTS_READY')->first();
        $visit->update(['visit_status_id' => $labResultsReadyStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Continue Consultation', $nextAction['label']);
        $this->assertEquals('continue_consultation', $nextAction['action']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_pharmacy_state(): void
    {
        $visit = Visit::factory()->create();

        // Test WAITING_FOR_PHARMACY state
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $visit->update(['visit_status_id' => $waitingForPharmacyStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Process Prescription', $nextAction['label']);
        $this->assertEquals('process_pharmacy', $nextAction['action']);
        $this->assertEquals('pharmacy.update', $nextAction['permission']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_billing_state(): void
    {
        $visit = Visit::factory()->create();

        // Test WAITING_FOR_BILLING state
        $waitingForBillingStatus = VisitStatus::where('code', 'WAITING_FOR_BILLING')->first();
        $visit->update(['visit_status_id' => $waitingForBillingStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Process Payment', $nextAction['label']);
        $this->assertEquals('process_payment', $nextAction['action']);
        $this->assertEquals('billing.update', $nextAction['permission']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_paid_state(): void
    {
        $visit = Visit::factory()->create();

        // Test PAID state
        $paidStatus = VisitStatus::where('code', 'PAID')->first();
        $visit->update(['visit_status_id' => $paidStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Complete Visit', $nextAction['label']);
        $this->assertEquals('complete_visit', $nextAction['action']);
        $this->assertEquals('visits.update', $nextAction['permission']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_completed_state(): void
    {
        $visit = Visit::factory()->create();

        // Test VISIT_COMPLETED state
        $visitCompletedStatus = VisitStatus::where('code', 'VISIT_COMPLETED')->first();
        $visit->update(['visit_status_id' => $visitCompletedStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Visit Completed', $nextAction['label']);
        $this->assertNull($nextAction['action']);
        $this->assertNull($nextAction['permission']);
    }

    public function test_visit_workspace_exposes_correct_next_action_for_cancelled_state(): void
    {
        $visit = Visit::factory()->create();

        // Test CANCELLED state
        $cancelledStatus = VisitStatus::where('code', 'CANCELLED')->first();
        $visit->update(['visit_status_id' => $cancelledStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Visit Cancelled', $nextAction['label']);
        $this->assertNull($nextAction['action']);
        $this->assertNull($nextAction['permission']);
    }

    public function test_user_facing_status_returns_correct_labels(): void
    {
        $visit = Visit::factory()->create();

        $statusTests = [
            'REGISTERED' => 'Registered',
            'WAITING_FOR_TRIAGE' => 'Waiting for Triage',
            'TRIAGE_IN_PROGRESS' => 'Triage in Progress',
            'WAITING_FOR_CONSULTATION' => 'Waiting for Consultation',
            'CONSULTATION_IN_PROGRESS' => 'Consultation in Progress',
            'WAITING_FOR_LAB' => 'Waiting for Lab Results',
            'LAB_IN_PROGRESS' => 'Lab Processing',
            'LAB_RESULTS_READY' => 'Lab Results Ready',
            'WAITING_FOR_PHARMACY' => 'Waiting for Pharmacy',
            'WAITING_FOR_BILLING' => 'Waiting for Payment',
            'PAID' => 'Paid',
            'VISIT_COMPLETED' => 'Completed',
            'CANCELLED' => 'Cancelled',
        ];

        foreach ($statusTests as $code => $expectedLabel) {
            $status = VisitStatus::where('code', $code)->first();
            $visit->update(['visit_status_id' => $status->id]);
            $visit->refresh();

            $this->assertEquals($expectedLabel, $visit->getUserFacingStatus());
        }
    }

    public function test_unauthorized_users_cannot_perform_hidden_backend_actions(): void
    {
        $visit = Visit::factory()->create();
        $user = User::factory()->create();

        // Set visit to WAITING_FOR_CONSULTATION state
        $waitingForConsultationStatus = VisitStatus::where('code', 'WAITING_FOR_CONSULTATION')->first();
        $visit->update(['visit_status_id' => $waitingForConsultationStatus->id]);

        // Try to access visit show page without proper permission
        $response = $this->actingAs($user)
            ->get("/visits/{$visit->id}");

        // Should be forbidden if user doesn't have visits.view permission
        $response->assertStatus(403);
    }

    public function test_lab_return_visit_shows_continue_consultation(): void
    {
        $visit = Visit::factory()->create();

        // Set visit to LAB_RESULTS_READY state
        $labResultsReadyStatus = VisitStatus::where('code', 'LAB_RESULTS_READY')->first();
        $visit->update(['visit_status_id' => $labResultsReadyStatus->id]);
        $visit->refresh();

        $nextAction = $visit->getNextAction();
        $this->assertEquals('Continue Consultation', $nextAction['label']);
        $this->assertEquals('continue_consultation', $nextAction['action']);
        $this->assertEquals('consultations.update', $nextAction['permission']);
    }

    public function test_workflow_transitions_create_timeline_entries(): void
    {
        $user = User::factory()->create();

        // Create a visit and log activity
        $visit = Visit::factory()->create();
        $this->actingAs($user);
        $visit->logActivity('visit.created', ['patient_id' => $visit->patient_id]);

        // Verify timeline entry was created
        $timeline = $visit->getTimeline();
        $this->assertCount(1, $timeline);
        $this->assertEquals('visit.created', $timeline[0]['action']);
        $this->assertEquals('Visit created', $timeline[0]['description']);
        $this->assertEquals($user->name, $timeline[0]['actor']);
        $this->assertArrayHasKey('timestamp', $timeline[0]);
        $this->assertArrayHasKey('meta', $timeline[0]);

        // Start visit and log activity
        $visit->logActivity('visit.started');
        $visit->refresh();
        $timeline = $visit->getTimeline();
        $this->assertCount(2, $timeline);
        $this->assertEquals('visit.started', $timeline[1]['action']);

        // Complete visit and log activity
        $visit->logActivity('visit.completed');
        $visit->refresh();
        $timeline = $visit->getTimeline();
        $this->assertCount(3, $timeline);
        $this->assertEquals('visit.completed', $timeline[2]['action']);
    }

    public function test_timeline_entries_are_in_chronological_order(): void
    {
        $user = User::factory()->create();
        $visit = Visit::factory()->create();

        $this->actingAs($user);

        // Create multiple timeline entries
        $visit->logActivity('visit.created');
        $visit->logActivity('visit.started');
        $visit->logActivity('visit.completed');
        $visit->refresh();

        $timeline = $visit->getTimeline();

        // Verify chronological order
        $this->assertCount(3, $timeline);
        $this->assertEquals('visit.created', $timeline[0]['action']);
        $this->assertEquals('visit.started', $timeline[1]['action']);
        $this->assertEquals('visit.completed', $timeline[2]['action']);
    }

    public function test_timeline_entries_include_actor_action_and_timestamp(): void
    {
        $user = User::factory()->create(['name' => 'Test User']);
        $visit = Visit::factory()->create();

        $this->actingAs($user);
        $visit->logActivity('visit.created', ['patient_id' => $visit->patient_id]);
        $visit->refresh();

        $timeline = $visit->getTimeline();

        $this->assertCount(1, $timeline);
        $entry = $timeline[0];

        // Verify actor
        $this->assertEquals('Test User', $entry['actor']);

        // Verify action
        $this->assertEquals('visit.created', $entry['action']);

        // Verify timestamp
        $this->assertArrayHasKey('timestamp', $entry);
        $this->assertNotEmpty($entry['timestamp']);

        // Verify meta data
        $this->assertArrayHasKey('meta', $entry);
        $this->assertEquals($visit->patient_id, $entry['meta']['patient_id']);
    }

    public function test_visit_workspace_renders_timeline_entries(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('visits.view');
        $visit = Visit::factory()->create();

        $this->actingAs($user);
        $visit->logActivity('visit.created');
        $visit->logActivity('visit.started');
        $visit->refresh();

        // Access visit show page
        $response = $this->actingAs($user)
            ->get("/visits/{$visit->id}");

        $response->assertStatus(200);

        // Check that the visit has timeline entries
        $timeline = $visit->getTimeline();
        $this->assertIsArray($timeline);
        $this->assertNotEmpty($timeline);
    }

    public function test_unauthorized_users_cannot_perform_workflow_actions(): void
    {
        $user = User::factory()->create();
        $visit = Visit::factory()->create();

        // Test unauthorized visit start
        $response = $this->actingAs($user)
            ->post("/visits/{$visit->id}/start");
        $response->assertStatus(403);

        // Test unauthorized visit complete
        $response = $this->actingAs($user)
            ->post("/visits/{$visit->id}/complete");
        $response->assertStatus(403);

        // Test unauthorized visit cancel
        $response = $this->actingAs($user)
            ->post("/visits/{$visit->id}/cancel");
        $response->assertStatus(403);
    }

    public function test_cancelled_visits_cannot_re_enter_active_queues(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('visits.update');
        $visit = Visit::factory()->create();

        $this->actingAs($user);
        $visitService = app(VisitService::class);
        $visitService->cancel($visit);

        // Try to add cancelled visit to queue
        $response = $this->actingAs($user)
            ->post("/visits/{$visit->id}/queue", [
                'department' => 'consultation',
                'priority' => 'normal',
            ]);

        $response->assertSessionHas('error');
    }

    public function test_completed_visits_cannot_re_enter_active_queues(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('visits.update');
        $visit = Visit::factory()->create();

        $this->actingAs($user);
        $visitService = app(VisitService::class);
        $visitService->start($visit);
        $visitService->complete($visit);

        // Try to add completed visit to queue
        $response = $this->actingAs($user)
            ->post("/visits/{$visit->id}/queue", [
                'department' => 'consultation',
                'priority' => 'normal',
            ]);

        $response->assertSessionHas('error');
    }

    public function test_double_submit_does_not_duplicate_consultations(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('consultations.create');
        $visit = Visit::factory()->create();

        $this->actingAs($user);

        // First consultation creation
        $response1 = $this->post('/consultations', [
            'visit_id' => $visit->id,
            'chief_complaint' => 'Headache',
        ]);

        $response1->assertRedirect();

        // Second consultation creation should redirect to existing
        $response2 = $this->post('/consultations', [
            'visit_id' => $visit->id,
            'chief_complaint' => 'Fever',
        ]);

        $response2->assertRedirect();

        // Should still have only one consultation
        $consultations = Consultation::where('visit_id', $visit->id)->get();
        $this->assertCount(1, $consultations);
    }

    public function test_double_submit_does_not_duplicate_queue_entries(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('visits.update');
        $visit = Visit::factory()->create();

        $this->actingAs($user);

        // First queue entry creation
        $response1 = $this->post("/visits/{$visit->id}/queue", [
            'department' => 'consultation',
            'priority' => 'normal',
        ]);

        $response1->assertSessionHas('success');

        // Second queue entry creation should fail
        $response2 = $this->post("/visits/{$visit->id}/queue", [
            'department' => 'consultation',
            'priority' => 'normal',
        ]);

        $response2->assertSessionHas('error');

        // Should still have only one active queue entry
        $queueEntries = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'consultation')
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->get();
        $this->assertCount(1, $queueEntries);
    }

    public function test_authorized_doctor_reassignment_preserves_consultation_history(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('consultations.update');
        $newProvider = User::factory()->create();

        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create([
            'visit_id' => $visit->id,
            'provider_id' => $user->id,
        ]);

        $this->actingAs($user);

        // Reassign consultation
        $consultationService = app(ConsultationService::class);
        $updatedConsultation = $consultationService->reassignProvider($consultation, $newProvider->id);

        // Verify provider changed
        $this->assertEquals($newProvider->id, $updatedConsultation->provider_id);

        // Verify consultation history is preserved
        $this->assertEquals($consultation->id, $updatedConsultation->id);
        $this->assertEquals($visit->id, $updatedConsultation->visit_id);

        // Verify reassignment was logged
        $timeline = $visit->getTimeline();
        $reassignmentEntry = collect($timeline)->firstWhere('action', 'consultation.reassigned');
        $this->assertNotNull($reassignmentEntry);
    }

    public function test_same_doctor_continuation_still_passes(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('consultations.update');
        $visit = Visit::factory()->create();

        $this->actingAs($user);

        // Create consultation with doctor
        $consultation = Consultation::factory()->create([
            'visit_id' => $visit->id,
            'provider_id' => $user->id,
        ]);

        // Same doctor should be able to continue
        $response = $this->get("/consultations/{$consultation->id}");
        $response->assertStatus(200);

        // Same doctor should be able to update
        $response = $this->put("/consultations/{$consultation->id}", [
            'chief_complaint' => 'Updated complaint',
        ]);
        $response->assertRedirect();
    }
}
