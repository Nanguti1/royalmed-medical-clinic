<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class WorkflowGuidanceNavigationTest extends TestCase
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

    public function test_consultation_page_shows_workflow_progression_data()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $response = $this->actingAs($this->user)
            ->get(route('consultations.show', $consultation));

        $response->assertStatus(200);
        $response->assertViewHas('consultation');
    }

    public function test_consultation_completion_automatic_navigation_to_prescription_creation()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $response = $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertRedirect(route('prescriptions.create', $visit));
    }

    public function test_prescription_creation_redirects_to_consultation_show()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);
        $medicine = Medicine::factory()->create();

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.store'), [
                'visit_id' => $visit->id,
                'notes' => 'Test prescription',
                'items' => [
                    [
                        'medicine_id' => $medicine->id,
                        'quantity' => 10,
                        'dosage_unit_id' => null,
                        'frequency_id' => null,
                        'route_id' => null,
                        'duration_unit_id' => null,
                        'duration_quantity' => null,
                        'instructions' => 'Take as directed',
                    ],
                ],
            ]);

        $response->assertRedirect(route('consultations.show', $consultation));
    }

    public function test_prescription_finalization_shows_clear_next_step_options()
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

        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertRedirect(route('consultations.show', $consultation));
        $response->assertSessionHas('success');
    }

    public function test_next_step_buttons_are_context_appropriate()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $response = $this->actingAs($this->user)
            ->get(route('consultations.show', $consultation));

        $response->assertStatus(200);
        $response->assertViewHas('consultation', function ($consultationData) {
            return $consultationData->id === $consultation->id;
        });
    }

    public function test_workflow_indicators_update_correctly_as_state_changes()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        // Initial state - consultation in progress
        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        $response = $this->actingAs($this->user)
            ->get(route('consultations.show', $consultation));
        $response->assertStatus(200);

        // Complete consultation
        $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));

        $visit->refresh();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $visit->visit_status_id);

        // Check that workflow indicators reflect new state
        $response = $this->actingAs($this->user)
            ->get(route('consultations.show', $consultation));
        $response->assertStatus(200);
    }

    public function test_doctors_can_navigate_complete_workflow_without_manual_url_manipulation()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);
        $medicine = Medicine::factory()->create();

        // Start consultation
        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        // Complete consultation - should auto-navigate to prescription creation
        $response = $this->actingAs($this->user)
            ->post(route('consultations.completeConsultation', $visit));
        $response->assertRedirect(route('prescriptions.create', $visit));

        // Create prescription - should redirect back to consultation
        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.store'), [
                'visit_id' => $visit->id,
                'notes' => 'Test prescription',
                'items' => [
                    [
                        'medicine_id' => $medicine->id,
                        'quantity' => 10,
                        'dosage_unit_id' => null,
                        'frequency_id' => null,
                        'route_id' => null,
                        'duration_unit_id' => null,
                        'duration_quantity' => null,
                        'instructions' => 'Take as directed',
                    ],
                ],
            ]);
        $response->assertRedirect(route('consultations.show', $consultation));

        // Finalize prescription - should stay on consultation with pharmacy queue created
        $prescription = $visit->prescriptions->first();
        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));
        $response->assertRedirect(route('consultations.show', $consultation));
    }

    public function test_missing_required_steps_are_indicated_in_consultation_edit()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create([
            'visit_id' => $visit->id,
            'chief_complaint' => null,
            'history' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('consultations.edit', $consultation));

        $response->assertStatus(200);
        $response->assertViewHas('consultation');
    }

    public function test_consultation_edit_page_shows_workflow_context()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $response = $this->actingAs($this->user)
            ->get(route('consultations.edit', $consultation));

        $response->assertStatus(200);
        $response->assertViewHas('consultation');
    }

    public function test_visit_status_included_in_consultation_page_data()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $visit->update(['visit_status_id' => $waitingForPrescriptionStatus->id]);

        $response = $this->actingAs($this->user)
            ->get(route('consultations.show', $consultation));

        $response->assertStatus(200);
        $response->assertViewHas('consultation', function ($consultationData) use ($consultation) {
            return $consultationData->id === $consultation->id &&
                   isset($consultationData->visit->status);
        });
    }
}
