<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
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
}
