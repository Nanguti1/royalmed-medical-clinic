<?php

namespace Tests\Feature;

use App\Actions\Prescriptions\DispensePrescriptionAction;
use App\Models\Consultation;
use App\Models\InventoryBatch;
use App\Models\Invoice;
use App\Models\InvoiceStatus;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use App\Models\Medicine;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\BillingService;
use App\Services\VisitService;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ConsultationPrescriptionBillingEndToEndTest extends TestCase
{
    use RefreshDatabase;

    protected User $doctor;
    protected User $pharmacist;
    protected User $cashier;
    protected User $nurse;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(VisitStatusSeeder::class);

        // Create permissions
        foreach ([
            'consultations.create', 'consultations.view', 'consultations.update',
            'visits.update', 'pharmacy.update', 'billing.update', 'lab_orders.update'
        ] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create different user roles
        $this->doctor = User::factory()->create();
        $this->doctor->givePermissionTo([
            'consultations.create', 'consultations.view', 'consultations.update', 'visits.update'
        ]);

        $this->pharmacist = User::factory()->create();
        $this->pharmacist->givePermissionTo(['pharmacy.update']);

        $this->cashier = User::factory()->create();
        $this->cashier->givePermissionTo(['billing.update']);

        $this->nurse = User::factory()->create();
        $this->nurse->givePermissionTo(['lab_orders.update']);
    }

    public function test_complete_consultation_prescription_pharmacy_billing_payment_workflow()
    {
        // 1. Doctor starts consultation
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        // 2. Doctor completes consultation
        $response = $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertRedirect(route('prescriptions.create', $visit));

        $visit->refresh();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $visit->visit_status_id);

        // 3. Doctor creates prescription
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $response = $this->actingAs($this->doctor)
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

        $prescription = $visit->prescriptions->first();
        $this->assertNotNull($prescription);
        $this->assertNull($prescription->finalized_at);

        // 4. Doctor finalizes prescription
        $response = $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertRedirect(route('consultations.show', $consultation));

        $prescription->refresh();
        $this->assertNotNull($prescription->finalized_at);
        $this->assertNotNull($prescription->prescription_number);

        $visit->refresh();
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $this->assertEquals($waitingForPharmacyStatus->id, $visit->visit_status_id);

        // 5. Pharmacist dispenses prescription
        $pharmacyQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->where('status', 'waiting')
            ->first();
        $this->assertNotNull($pharmacyQueueEntry);

        $dispenseAction = app(DispensePrescriptionAction::class);
        $dispenseAction->execute($prescription);

        $prescription->refresh();
        $this->assertNotNull($prescription->dispensed_at);

        $visit->refresh();
        $waitingForBillingStatus = VisitStatus::where('code', 'WAITING_FOR_BILLING')->first();
        $this->assertEquals($waitingForBillingStatus->id, $visit->visit_status_id);

        // 6. Cashier processes payment
        $billingService = app(BillingService::class);
        $invoice = $billingService->generateInvoice($visit);

        $this->assertNotNull($invoice);
        $this->assertEquals($visit->id, $invoice->visit_id);

        $payment = Payment::factory()->create([
            'invoice_id' => $invoice->id,
            'amount' => $invoice->total_amount,
        ]);

        $paidStatus = InvoiceStatus::where('code', 'paid')->first();
        $invoice->status_id = $paidStatus->id;
        $invoice->save();

        $visit->refresh();
        $paidStatus = VisitStatus::where('code', 'PAID')->first();
        $this->assertEquals($paidStatus->id, $visit->visit_status_id);

        // 7. Visit is completed
        $visitService = app(VisitService::class);
        $visitService->complete($visit);

        $visit->refresh();
        $this->assertNotNull($visit->completed_at);

        // 8. Verify timeline logging
        $timeline = $visit->getTimeline();
        $timelineActions = collect($timeline)->pluck('action')->toArray();

        $this->assertContains('visit.consultation_completed', $timelineActions);
        $this->assertContains('visit.prescription_created', $timelineActions);
        $this->assertContains('visit.prescription_finalized', $timelineActions);
        $this->assertContains('visit.prescription_dispensed', $timelineActions);
        $this->assertContains('visit.invoice_generated', $timelineActions);
        $this->assertContains('visit.payment_recorded', $timelineActions);
        $this->assertContains('visit.completed', $timelineActions);
    }

    public function test_consultation_lab_continue_consultation_prescription_pharmacy_billing_workflow()
    {
        // 1. Doctor starts consultation
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        // 2. Doctor orders lab tests
        $labTest = LabTest::factory()->create();
        $labOrder = LabOrder::factory()->create(['visit_id' => $visit->id]);
        LabOrderItem::factory()->create([
            'lab_order_id' => $labOrder->id,
            'lab_test_id' => $labTest->id,
        ]);

        $visit->refresh();
        $waitingForLabStatus = VisitStatus::where('code', 'WAITING_FOR_LAB')->first();
        $visit->update(['visit_status_id' => $waitingForLabStatus->id]);

        // 3. Nurse processes lab order
        $labOrder->update(['status' => 'in_progress', 'in_progress_at' => now()]);

        $visit->refresh();
        $labInProgressStatus = VisitStatus::where('code', 'LAB_IN_PROGRESS')->first();
        $this->assertEquals($labInProgressStatus->id, $visit->visit_status_id);

        // 4. Lab results are ready
        $labOrder->update(['status' => 'completed', 'completed_at' => now()]);

        $visit->refresh();
        $labResultsReadyStatus = VisitStatus::where('code', 'LAB_RESULTS_READY')->first();
        $this->assertEquals($labResultsReadyStatus->id, $visit->visit_status_id);

        // 5. Doctor continues consultation
        $response = $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertRedirect(route('prescriptions.create', $visit));

        $visit->refresh();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $visit->visit_status_id);

        // 6. Create and finalize prescription
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        // 7. Verify timeline includes lab workflow
        $timeline = $visit->getTimeline();
        $timelineActions = collect($timeline)->pluck('action')->toArray();

        $this->assertContains('visit.lab_ordered', $timelineActions);
        $this->assertContains('visit.lab_completed', $timelineActions);
        $this->assertContains('visit.consultation_completed', $timelineActions);
        $this->assertContains('visit.prescription_finalized', $timelineActions);
    }

    public function test_both_lab_and_prescription_workflow_integration()
    {
        // 1. Start consultation with both lab and prescription
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        // 2. Order lab tests
        $labTest = LabTest::factory()->create();
        $labOrder = LabOrder::factory()->create(['visit_id' => $visit->id]);
        LabOrderItem::factory()->create([
            'lab_order_id' => $labOrder->id,
            'lab_test_id' => $labTest->id,
        ]);

        // 3. Create prescription
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        // 4. Complete consultation
        $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $visit->refresh();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $visit->visit_status_id);

        // 5. Finalize prescription
        $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        $visit->refresh();
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $this->assertEquals($waitingForPharmacyStatus->id, $visit->visit_status_id);

        // 6. Complete lab processing
        $labOrder->update(['status' => 'completed', 'completed_at' => now()]);

        // 7. Verify both workflows are logged in timeline
        $timeline = $visit->getTimeline();
        $timelineActions = collect($timeline)->pluck('action')->toArray();

        $this->assertContains('visit.lab_ordered', $timelineActions);
        $this->assertContains('visit.prescription_created', $timelineActions);
        $this->assertContains('visit.prescription_finalized', $timelineActions);
        $this->assertContains('visit.lab_completed', $timelineActions);
    }

    public function test_different_user_roles_have_appropriate_access()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        // Doctor can complete consultation
        $response = $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));
        $response->assertRedirect();

        // Pharmacist cannot complete consultation
        $response = $this->actingAs($this->pharmacist)
            ->post(route('consultations.completeConsultation', $visit));
        $response->assertStatus(403);

        // Cashier cannot complete consultation
        $response = $this->actingAs($this->cashier)
            ->post(route('consultations.completeConsultation', $visit));
        $response->assertStatus(403);

        // Doctor can finalize prescription
        $medicine = Medicine::factory()->create();
        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $response = $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));
        $response->assertRedirect();

        // Pharmacist cannot finalize prescription (unless they have the permission)
        $response = $this->actingAs($this->pharmacist)
            ->post(route('prescriptions.finalize', $prescription));
        $response->assertStatus(403);
    }

    public function test_cancelled_visit_workflow_error_handling()
    {
        $visit = Visit::factory()->create(['cancelled_at' => now()]);
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $cancelledStatus = VisitStatus::where('code', 'CANCELLED')->first();
        $visit->update(['visit_status_id' => $cancelledStatus->id]);

        // Cannot complete consultation for cancelled visit
        $response = $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertSessionHas('error');
        $visit->refresh();
        $this->assertEquals($cancelledStatus->id, $visit->visit_status_id);
    }

    public function test_completed_visit_workflow_error_handling()
    {
        $visit = Visit::factory()->create(['completed_at' => now()]);
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $completedStatus = VisitStatus::where('code', 'VISIT_COMPLETED')->first();
        $visit->update(['visit_status_id' => $completedStatus->id]);

        // Cannot complete consultation for completed visit
        $response = $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $response->assertSessionHas('error');
        $visit->refresh();
        $this->assertEquals($completedStatus->id, $visit->visit_status_id);
    }

    public function test_prescription_without_items_cannot_be_finalized()
    {
        $visit = Visit::factory()->create();
        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);

        $response = $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertSessionHas('error');
        $prescription->refresh();
        $this->assertNull($prescription->finalized_at);
    }

    public function test_already_finalized_prescription_cannot_be_finalized_again()
    {
        $visit = Visit::factory()->create();
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

        $response = $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        $response->assertSessionHas('error');
    }

    public function test_queue_creation_and_removal_at_each_workflow_step()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        // 1. Start consultation - create consultation queue
        $consultationQueue = QueueEntry::create([
            'visit_id' => $visit->id,
            'department' => 'consultation',
            'status' => 'in_progress',
            'priority' => 'normal',
            'queue_number' => 'C001',
            'position' => 1,
        ]);

        $this->assertNotNull($consultationQueue);
        $this->assertEquals('in_progress', $consultationQueue->status);

        // 2. Complete consultation - remove from consultation queue
        $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $consultationQueue->refresh();
        $this->assertEquals('completed', $consultationQueue->status);
        $this->assertNotNull($consultationQueue->completed_at);

        // 3. Finalize prescription - create pharmacy queue
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        $pharmacyQueue = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->where('status', 'waiting')
            ->first();
        $this->assertNotNull($pharmacyQueue);

        // 4. Dispense prescription - complete pharmacy queue
        $dispenseAction = app(DispensePrescriptionAction::class);
        $dispenseAction->execute($prescription);

        $pharmacyQueue->refresh();
        $this->assertEquals('completed', $pharmacyQueue->status);
    }

    public function test_timeline_completeness_for_all_workflow_variations()
    {
        // Test with prescription only
        $visit1 = Visit::factory()->create();
        $consultation1 = Consultation::factory()->create(['visit_id' => $visit1->id]);

        $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit1));

        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription1 = Prescription::factory()->create(['visit_id' => $visit1->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription1->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription1));

        $timeline1 = $visit1->getTimeline();
        $this->assertNotEmpty($timeline1);
        $this->assertContains('visit.consultation_completed', collect($timeline1)->pluck('action')->toArray());
        $this->assertContains('visit.prescription_finalized', collect($timeline1)->pluck('action')->toArray());

        // Test with lab only
        $visit2 = Visit::factory()->create();
        $consultation2 = Consultation::factory()->create(['visit_id' => $visit2->id]);

        $labTest = LabTest::factory()->create();
        $labOrder = LabOrder::factory()->create(['visit_id' => $visit2->id]);
        LabOrderItem::factory()->create([
            'lab_order_id' => $labOrder->id,
            'lab_test_id' => $labTest->id,
        ]);

        $labOrder->update(['status' => 'completed', 'completed_at' => now()]);

        $timeline2 = $visit2->getTimeline();
        $this->assertNotEmpty($timeline2);
        $this->assertContains('visit.lab_ordered', collect($timeline2)->pluck('action')->toArray());
        $this->assertContains('visit.lab_completed', collect($timeline2)->pluck('action')->toArray());

        // Test with both lab and prescription
        $visit3 = Visit::factory()->create();
        $consultation3 = Consultation::factory()->create(['visit_id' => $visit3->id]);

        $labTest2 = LabTest::factory()->create();
        $labOrder2 = LabOrder::factory()->create(['visit_id' => $visit3->id]);
        LabOrderItem::factory()->create([
            'lab_order_id' => $labOrder2->id,
            'lab_test_id' => $labTest2->id,
        ]);

        $prescription2 = Prescription::factory()->create(['visit_id' => $visit3->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription2->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $labOrder2->update(['status' => 'completed', 'completed_at' => now()]);

        $timeline3 = $visit3->getTimeline();
        $this->assertNotEmpty($timeline3);
        $this->assertContains('visit.lab_ordered', collect($timeline3)->pluck('action')->toArray());
        $this->assertContains('visit.lab_completed', collect($timeline3)->pluck('action')->toArray());
        $this->assertContains('visit.prescription_created', collect($timeline3)->pluck('action')->toArray());
    }

    public function test_visit_state_transitions_are_correct_at_each_step()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        // Initial state
        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);
        $this->assertEquals($consultationInProgressStatus->id, $visit->visit_status_id);

        // After consultation completion
        $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));

        $visit->refresh();
        $waitingForPrescriptionStatus = VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first();
        $this->assertEquals($waitingForPrescriptionStatus->id, $visit->visit_status_id);

        // After prescription finalization
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()->create(['visit_id' => $visit->id]);
        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));

        $visit->refresh();
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $this->assertEquals($waitingForPharmacyStatus->id, $visit->visit_status_id);

        // After prescription dispensing
        $dispenseAction = app(DispensePrescriptionAction::class);
        $dispenseAction->execute($prescription);

        $visit->refresh();
        $waitingForBillingStatus = VisitStatus::where('code', 'WAITING_FOR_BILLING')->first();
        $this->assertEquals($waitingForBillingStatus->id, $visit->visit_status_id);
    }

    public function test_doctors_can_complete_workflow_without_manual_navigation()
    {
        $visit = Visit::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id]);

        $consultationInProgressStatus = VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first();
        $visit->update(['visit_status_id' => $consultationInProgressStatus->id]);

        // Complete consultation - should auto-navigate to prescription creation
        $response = $this->actingAs($this->doctor)
            ->post(route('consultations.completeConsultation', $visit));
        $response->assertRedirect(route('prescriptions.create', $visit));

        // Create prescription - should redirect back to consultation
        $medicine = Medicine::factory()->create();
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $response = $this->actingAs($this->doctor)
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

        // Finalize prescription - should stay on consultation
        $prescription = $visit->prescriptions->first();
        $response = $this->actingAs($this->doctor)
            ->post(route('prescriptions.finalize', $prescription));
        $response->assertRedirect(route('consultations.show', $consultation));
    }
}
