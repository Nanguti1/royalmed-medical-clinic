<?php

namespace Tests\Feature;

use App\Actions\Laboratory\CompleteLabOrderAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Laboratory\StartLabOrderAction;
use App\Models\Consultation;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Prescription;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\QueueService;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ConsultationQueueWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(VisitStatusSeeder::class);

        foreach (['consultations.create', 'consultations.view', 'consultations.update', 'laboratory.order', 'prescriptions.view'] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->user = User::factory()->create();
        $this->user->givePermissionTo([
            'consultations.create',
            'consultations.view',
            'consultations.update',
            'laboratory.order',
            'prescriptions.view',
        ]);
    }

    public function test_doctor_queue_renders_start_consultation_for_new_queue_items()
    {
        $visit = Visit::factory()->create();
        $queueService = app(QueueService::class);
        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
            'priority' => 'normal',
        ]);

        $response = $this->actingAs($this->user)->get(route('consultations.index'));
        $response->assertStatus(200);

        // Check that the queue entry is present without consultation
        $response->assertInertia(function ($page) {
            $page->component('consultations/index')
                ->has('entries', 1)
                ->where('entries.0.visit.consultation', null);
        });
    }

    public function test_doctor_queue_renders_continue_consultation_for_lab_results_ready_queue_items()
    {
        $visit = Visit::factory()->create();
        $doctor = User::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id, 'provider_id' => $doctor->id]);
        $test = LabTest::factory()->create();

        $createAction = new CreateLabOrderAction;
        $order = $createAction->execute([
            'visit_id' => $visit->id,
            'ordered_by' => $doctor->id,
            'status' => 'ordered',
            'tests' => [['lab_test_id' => $test->id]],
        ]);

        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $startAction = new StartLabOrderAction;
        $order = $startAction->execute($order);

        LabResult::factory()->create(['lab_order_item_id' => $item->id, 'lab_test_id' => $test->id]);

        $queueService = app(QueueService::class);
        $completeAction = new CompleteLabOrderAction($queueService);
        $order = $completeAction->execute($order);

        $response = $this->actingAs($this->user)->get(route('consultations.index'));
        $response->assertStatus(200);

        // Check that the consultation is present and metadata indicates lab return
        $response->assertInertia(function ($page) use ($consultation) {
            $page->component('consultations/index')
                ->has('entries', 1)
                ->where('entries.0.visit.consultation.id', $consultation->id)
                ->where('entries.0.metadata.action', 'continue_consultation');
        });
    }

    public function test_continue_action_opens_existing_consultation()
    {
        $visit = Visit::factory()->create();
        $doctor = User::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id, 'provider_id' => $doctor->id]);
        $test = LabTest::factory()->create();

        $createAction = new CreateLabOrderAction;
        $order = $createAction->execute([
            'visit_id' => $visit->id,
            'ordered_by' => $doctor->id,
            'status' => 'ordered',
            'tests' => [['lab_test_id' => $test->id]],
        ]);

        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $startAction = new StartLabOrderAction;
        $order = $startAction->execute($order);

        LabResult::factory()->create(['lab_order_item_id' => $item->id, 'lab_test_id' => $test->id]);

        $queueService = app(QueueService::class);
        $completeAction = new CompleteLabOrderAction($queueService);
        $order = $completeAction->execute($order);

        $queueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'consultation')
            ->first();

        $this->assertNotNull($queueEntry);
        $this->assertEquals('continue_consultation', $queueEntry->metadata['action']);
        $this->assertEquals($consultation->id, $queueEntry->metadata['consultation_id']);

        $response = $this->actingAs($this->user)->get(route('consultations.show', $consultation));
        $response->assertStatus(200);
        $response->assertInertia(function ($page) use ($consultation) {
            $page->component('consultations/show')
                ->where('consultation.id', $consultation->id);
        });
    }

    public function test_lab_results_are_visible_on_consultation_screen()
    {
        $visit = Visit::factory()->create();
        $doctor = User::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id, 'provider_id' => $doctor->id]);
        $test = LabTest::factory()->create(['name' => 'CBC']);

        $createAction = new CreateLabOrderAction;
        $order = $createAction->execute([
            'visit_id' => $visit->id,
            'ordered_by' => $doctor->id,
            'status' => 'ordered',
            'tests' => [['lab_test_id' => $test->id]],
        ]);

        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $startAction = new StartLabOrderAction;
        $order = $startAction->execute($order);

        $result = LabResult::factory()->create([
            'lab_order_item_id' => $item->id,
            'lab_test_id' => $test->id,
            'result_value' => '12.5 g/dL',
            'units' => 'g/dL',
        ]);

        $queueService = app(QueueService::class);
        $completeAction = new CompleteLabOrderAction($queueService);
        $order = $completeAction->execute($order);

        $response = $this->actingAs($this->user)->get(route('consultations.show', $consultation));
        $response->assertStatus(200);

        // Check that the consultation has lab orders loaded via database
        $consultation->refresh();
        $consultation->load('visit.labOrders.items.result');
        $this->assertNotNull($consultation->visit->labOrders);
        $this->assertCount(1, $consultation->visit->labOrders);
        $this->assertEquals('CBC', $consultation->visit->labOrders->first()->items->first()->test->name);
        $this->assertEquals('12.5 g/dL', $consultation->visit->labOrders->first()->items->first()->result->result_value);
    }

    public function test_consultation_shows_lab_completed_status_when_results_ready()
    {
        $visit = Visit::factory()->create();
        $doctor = User::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id, 'provider_id' => $doctor->id]);
        $test = LabTest::factory()->create(['name' => 'CBC']);

        $createAction = new CreateLabOrderAction;
        $order = $createAction->execute([
            'visit_id' => $visit->id,
            'ordered_by' => $doctor->id,
            'status' => 'ordered',
            'tests' => [['lab_test_id' => $test->id]],
        ]);

        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $startAction = new StartLabOrderAction;
        $order = $startAction->execute($order);

        LabResult::factory()->create([
            'lab_order_item_id' => $item->id,
            'lab_test_id' => $test->id,
            'result_value' => '12.5 g/dL',
            'units' => 'g/dL',
        ]);

        $queueService = app(QueueService::class);
        $completeAction = new CompleteLabOrderAction($queueService);
        $order = $completeAction->execute($order);

        $response = $this->actingAs($this->user)->get(route('consultations.show', $consultation));
        $response->assertStatus(200);

        // Check that the visit status is LAB_RESULTS_READY
        $response->assertInertia(function ($page) {
            $page->component('consultations/show')
                ->where('consultation.visit.status.code', 'LAB_RESULTS_READY');
        });

        // Verify lab orders are present in database
        $consultation->refresh();
        $consultation->load('visit.labOrders');
        $this->assertCount(1, $consultation->visit->labOrders);
        $this->assertEquals($order->id, $consultation->visit->labOrders->first()->id);
    }

    public function test_visits_beyond_consultation_stage_do_not_show_start_button()
    {
        $visit = Visit::factory()->create();

        $queueService = app(QueueService::class);
        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
            'priority' => 'normal',
        ]);

        // Simulate visit progressing to later stage while in queue
        $visit->update(['visit_status_id' => VisitStatus::where('code', 'WAITING_FOR_PRESCRIPTION')->first()->id]);

        $response = $this->actingAs($this->user)->get(route('consultations.index'));
        $response->assertStatus(200);

        // Check that the visit status is included in the response
        $response->assertInertia(function ($page) {
            $page->component('consultations/index')
                ->has('entries', 1)
                ->where('entries.0.visit.status.code', 'WAITING_FOR_PRESCRIPTION');
        });
    }

    public function test_visits_with_existing_consultation_show_continue_button()
    {
        $visit = Visit::factory()->create();
        $visit->update(['visit_status_id' => VisitStatus::where('code', 'CONSULTATION_IN_PROGRESS')->first()->id]);

        $doctor = User::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id, 'provider_id' => $doctor->id]);

        $queueService = app(QueueService::class);
        $queueService->add([
            'visit_id' => $visit->id,
            'department' => 'consultation',
            'priority' => 'normal',
        ]);

        $response = $this->actingAs($this->user)->get(route('consultations.index'));
        $response->assertStatus(200);

        // Check that the consultation data is included in the response
        $response->assertInertia(function ($page) use ($consultation) {
            $page->component('consultations/index')
                ->has('entries', 1)
                ->where('entries.0.visit.consultation.id', $consultation->id);
        });
    }

    public function test_consultation_shows_correct_status_after_prescription_finalized()
    {
        $visit = Visit::factory()->create();
        $doctor = User::factory()->create();
        $consultation = Consultation::factory()->create(['visit_id' => $visit->id, 'provider_id' => $doctor->id]);

        // Create a prescription and finalize it
        $prescription = Prescription::factory()->create([
            'visit_id' => $visit->id,
            'prescribed_by' => $doctor->id,
            'finalized_at' => now(),
        ]);

        // Update visit status to waiting for pharmacy
        $visit->update(['visit_status_id' => VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first()->id]);

        $response = $this->actingAs($this->user)->get(route('consultations.show', $consultation));
        $response->assertStatus(200);

        // Check that the visit status is WAITING_FOR_PHARMACY
        $response->assertInertia(function ($page) {
            $page->component('consultations/show')
                ->where('consultation.visit.status.code', 'WAITING_FOR_PHARMACY');
        });

        // Verify prescription is present and finalized
        $consultation->refresh();
        $consultation->load('visit.prescriptions');
        $this->assertCount(1, $consultation->visit->prescriptions);
        $this->assertNotNull($consultation->visit->prescriptions->first()->finalized_at);
    }
}
