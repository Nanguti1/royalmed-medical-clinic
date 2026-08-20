<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PrescriptionFinalizationWorkflowTest extends TestCase
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

    public function test_doctor_can_finalize_prescription_from_consultation_ui()
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

        $prescription->refresh();
        $this->assertNotNull($prescription->finalized_at);
        $this->assertNotNull($prescription->prescription_number);
    }

    public function test_finalizing_prescription_transitions_visit_to_waiting_for_pharmacy_status()
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

        $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $visit->refresh();
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $this->assertEquals($waitingForPharmacyStatus->id, $visit->visit_status_id);
    }

    public function test_finalizing_prescription_creates_pharmacy_queue_entry()
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

        $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $prescription->refresh();
        $pharmacyQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->where('status', 'waiting')
            ->first();

        $this->assertNotNull($pharmacyQueueEntry);
        $this->assertEquals($prescription->id, $pharmacyQueueEntry->metadata['prescription_id']);
        $this->assertEquals($prescription->prescription_number, $pharmacyQueueEntry->metadata['prescription_number']);
    }

    public function test_already_finalized_prescriptions_cannot_be_finalized_again()
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

        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertSessionHas('error');
    }

    public function test_unauthorized_users_cannot_finalize_prescriptions()
    {
        $unauthorizedUser = User::factory()->create();
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $response = $this->actingAs($unauthorizedUser)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertStatus(403);

        $prescription->refresh();
        $this->assertNull($prescription->finalized_at);
    }

    public function test_prescription_finalization_is_logged_in_visit_timeline()
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

        $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $visit->refresh();
        $timeline = $visit->getTimeline();

        $this->assertTrue(collect($timeline)->contains('action', 'visit.prescription_finalized'));
    }

    public function test_doctor_is_redirected_appropriately_after_prescription_finalization()
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
        $response->assertSessionHas('success', 'Prescription finalized successfully. Pharmacy queue has been created.');
    }

    public function test_prescription_without_items_cannot_be_finalized()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);

        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertSessionHas('error');

        $prescription->refresh();
        $this->assertNull($prescription->finalized_at);
    }

    public function test_redirect_to_visit_show_when_consultation_does_not_exist()
    {
        $visit = Visit::factory()->create();
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertRedirect(route('visits.show', $visit));
        $response->assertSessionHas('success');
    }
}
