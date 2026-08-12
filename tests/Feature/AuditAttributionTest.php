<?php

namespace Tests\Feature;

use App\Actions\Billing\GenerateInvoiceAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Visits\CancelVisitAction;
use App\Actions\Visits\CompleteVisitAction;
use App\Actions\Visits\StartVisitAction;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use App\Services\PatientService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditAttributionTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_creation_records_creator()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'created_by' => $user->id,
        ]);

        $this->assertEquals($user->id, $patient->created_by);
        $this->assertNull($patient->updated_by);
    }

    public function test_patient_update_records_updater()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->actingAs($user);

        $patient->update([
            'first_name' => 'Jane',
            'updated_by' => $user->id,
        ]);

        $this->assertEquals($user->id, $patient->fresh()->updated_by);
    }

    public function test_patient_service_records_creator_and_updater()
    {
        $user = User::factory()->create();
        $service = app(PatientService::class);

        $this->actingAs($user);

        $patient = $service->register([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertEquals($user->id, $patient->created_by);
        $this->assertNull($patient->updated_by);

        $updatedPatient = $service->update($patient, [
            'first_name' => 'Jane',
        ]);

        $this->assertEquals($user->id, $updatedPatient->updated_by);
    }

    public function test_invoice_creation_records_creator()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $this->actingAs($user);

        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'invoice_number' => 'INV-001',
            'created_by' => $user->id,
        ]);

        $this->assertEquals($user->id, $invoice->created_by);
    }

    public function test_invoice_action_records_creator()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $this->actingAs($user);

        $action = app(GenerateInvoiceAction::class);
        $invoice = $action->execute([
            'visit_id' => $visit->id,
            'invoice_number' => 'INV-001',
        ]);

        $this->assertEquals($user->id, $invoice->created_by);
    }

    public function test_visit_start_records_actor()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $this->actingAs($user);

        $action = app(StartVisitAction::class);
        $startedVisit = $action->execute($visit);

        $this->assertNotNull($startedVisit->started_at);
        $this->assertEquals($user->id, $startedVisit->started_by);
    }

    public function test_visit_complete_records_actor()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
            'started_at' => now(),
        ]);

        // Create invoice to satisfy visit completion validation
        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'invoice_number' => 'INV-001',
            'total_amount' => 100,
            'due_amount' => 0,
        ]);

        $this->actingAs($user);

        $action = app(CompleteVisitAction::class);
        $completedVisit = $action->execute($visit);

        $this->assertNotNull($completedVisit->completed_at);
        $this->assertEquals($user->id, $completedVisit->completed_by);
    }

    public function test_visit_cancel_records_actor()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $this->actingAs($user);

        $action = app(CancelVisitAction::class);
        $cancelledVisit = $action->execute($visit);

        $this->assertNotNull($cancelledVisit->cancelled_at);
        $this->assertEquals($user->id, $cancelledVisit->cancelled_by);
    }

    public function test_lab_order_creation_records_orderer()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $this->actingAs($user);

        $action = app(CreateLabOrderAction::class);
        $labOrder = $action->execute([
            'visit_id' => $visit->id,
        ]);

        $this->assertEquals($user->id, $labOrder->ordered_by);
    }

    public function test_attribution_fields_are_nullable()
    {
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertNull($patient->created_by);
        $this->assertNull($patient->updated_by);

        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $this->assertNull($visit->started_by);
        $this->assertNull($visit->completed_by);
        $this->assertNull($visit->cancelled_by);
    }

    public function test_existing_attribution_fields_preserved()
    {
        $user = User::factory()->create();
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
            'receptionist_id' => $user->id,
        ]);

        $this->assertEquals($user->id, $visit->receptionist_id);
    }
}
