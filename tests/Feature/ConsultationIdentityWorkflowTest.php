<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\InventoryBatch;
use App\Models\LabTest;
use App\Models\Medicine;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ConsultationIdentityWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['consultations.create', 'consultations.view', 'consultations.update', 'laboratory.order'] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->user = User::factory()->create();
        $this->user->givePermissionTo([
            'consultations.create',
            'consultations.view',
            'consultations.update',
            'laboratory.order',
        ]);
    }

    public function test_starting_consultation_twice_for_same_visit_reuses_existing_consultation(): void
    {
        $visit = Visit::factory()->create();

        $firstResponse = $this->actingAs($this->user)->post(route('consultations.store'), [
            'visit_id' => $visit->id,
            'chief_complaint' => 'Headache',
            'subjective' => 'Initial symptoms.',
        ]);

        $firstConsultation = Consultation::where('visit_id', $visit->id)->firstOrFail();
        $firstResponse->assertRedirect(route('consultations.show', $firstConsultation));

        $secondResponse = $this->actingAs($this->user)->post(route('consultations.store'), [
            'visit_id' => $visit->id,
            'chief_complaint' => 'Duplicate submission',
            'subjective' => 'This should not create a new consultation.',
        ]);

        $secondResponse->assertRedirect(route('consultations.show', $firstConsultation));
        $this->assertSame(1, Consultation::where('visit_id', $visit->id)->count());
        $this->assertSame('Headache', $firstConsultation->fresh()->chief_complaint);
    }

    public function test_lab_order_creation_redirects_to_existing_visit_consultation(): void
    {
        $consultation = Consultation::factory()->create();
        $labTest = LabTest::factory()->create();

        $response = $this->actingAs($this->user)->post(route('laboratory.store'), [
            'visit_id' => $consultation->visit_id,
            'ordered_by' => $this->user->id,
            'tests' => [
                ['lab_test_id' => $labTest->id],
            ],
        ]);

        $response->assertRedirect(route('consultations.show', $consultation));
    }

    public function test_prescription_creation_redirects_to_existing_visit_consultation(): void
    {
        $consultation = Consultation::factory()->create();
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 10,
            'expiry_date' => now()->addYear(),
        ]);

        $response = $this->actingAs($this->user)->post(route('prescriptions.store'), [
            'visit_id' => $consultation->visit_id,
            'prescribed_by' => $this->user->id,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 1,
                    'instructions' => 'Take once daily.',
                ],
            ],
        ]);

        $response->assertRedirect(route('consultations.show', $consultation));
    }
}
