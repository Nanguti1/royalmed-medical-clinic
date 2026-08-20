<?php

namespace Tests\Feature;

use App\Actions\Laboratory\CompleteLabOrderAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Laboratory\StartLabOrderAction;
use App\Models\Consultation;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\QueueEntry;
use App\Models\User;
use App\Models\Visit;
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
        $response->assertSee('Start Consultation');
        $response->assertDontSee('Continue Consultation');
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
        $response->assertSee('Continue Consultation');
        $response->assertSee('Lab Results Ready');
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
        $response->assertSee($consultation->id);
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

        // Check that the consultation has lab orders loaded
        $consultation->refresh();
        $consultation->load('visit.labOrders.items.result');
        $this->assertNotNull($consultation->visit->labOrders);
        $this->assertCount(1, $consultation->visit->labOrders);
        $this->assertEquals('CBC', $consultation->visit->labOrders->first()->items->first()->test->name);
        $this->assertEquals('12.5 g/dL', $consultation->visit->labOrders->first()->items->first()->result->result_value);
    }
}
