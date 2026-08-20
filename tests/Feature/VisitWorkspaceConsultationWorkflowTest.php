<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\VisitService;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class VisitWorkspaceConsultationWorkflowTest extends TestCase
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

    public function test_visit_workspace_shows_create_prescription_for_waiting_for_prescription_status()
    {
        $visit = Visit::factory()->create();

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $nextAction = $visit->getNextAction();

        $this->assertEquals('Create Prescription', $nextAction['label']);
        $this->assertEquals('create_prescription', $nextAction['action']);
        $this->assertEquals('consultations.create', $nextAction['permission']);
    }

    public function test_visit_workspace_shows_finalize_prescription_when_prescription_is_in_draft_state()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $nextAction = $visit->getNextAction();

        $this->assertEquals('Finalize Prescription', $nextAction['label']);
        $this->assertEquals('finalize_prescription', $nextAction['action']);
        $this->assertEquals('consultations.create', $nextAction['permission']);
    }

    public function test_visit_workspace_shows_accurate_next_actions_for_all_consultation_workflow_states()
    {
        // Test CONSULTATION_IN_PROGRESS
        $visit1 = Visit::factory()->create();
        $consultation1 = Consultation::factory()->create(['visit_id' => $visit1->id]);
        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit1->update(['visit_status_id' => $consultationInProgressStatus->id]);
        $nextAction = $visit1->getNextAction();
        $this->assertEquals('Complete Consultation', $nextAction['label']);

        // Test WAITING_FOR_PRESCRIPTION
        $visit2 = Visit::factory()->create();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit2->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);
        $nextAction = $visit2->getNextAction();
        $this->assertEquals('Create Prescription', $nextAction['label']);

        // Test WAITING_FOR_PHARMACY
        $visit3 = Visit::factory()->create();
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $visit3->update(['visit_status_id' => $waitingForPharmacyStatus->id]);
        $nextAction = $visit3->getNextAction();
        $this->assertEquals('Process Prescription', $nextAction['label']);
    }

    public function test_visit_workspace_shows_correct_user_facing_status_for_intermediate_states()
    {
        $visit = Visit::factory()->create();

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $userFacingStatus = $visit->getUserFacingStatus();

        $this->assertEquals('Waiting for Prescription', $userFacingStatus);
    }

    public function test_visit_service_complete_consultation_method_handles_state_transitions_correctly()
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

    public function test_timeline_logging_works_for_consultation_completion_workflow()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $visitService = app(VisitService::class);
        $visitService->completeConsultation($visit);

        $visit->refresh();
        $timeline = $visit->getTimeline();

        $this->assertTrue(collect($timeline)->contains('action', 'visit.consultation_completed'));
    }

    public function test_visit_next_action_prioritizes_draft_prescription_over_status_based_action()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        // Set to a status that would normally show a different action
        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $nextAction = $visit->getNextAction();

        // Should show finalize prescription even though status is CONSULTATION_IN_PROGRESS
        $this->assertEquals('Finalize Prescription', $nextAction['label']);
        $this->assertEquals('finalize_prescription', $nextAction['action']);
    }

    public function test_visit_next_action_does_not_show_finalize_for_prescriptions_without_items()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        // Create prescription without items
        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $nextAction = $visit->getNextAction();

        // Should show create prescription, not finalize
        $this->assertEquals('Create Prescription', $nextAction['label']);
        $this->assertEquals('create_prescription', $nextAction['action']);
    }

    public function test_visit_next_action_does_not_show_finalize_for_finalized_prescriptions()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()->create([
            'visit_id' => $visit->id,
            'finalized_at' => now(),
            'prescription_number' => 'RX12345',
        ]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $visit->update(['visit_status_id' => $waitingForPharmacyStatus->id]);

        $nextAction = $visit->getNextAction();

        // Should show process prescription, not finalize
        $this->assertEquals('Process Prescription', $nextAction['label']);
        $this->assertEquals('process_pharmacy', $nextAction['action']);
    }
}
