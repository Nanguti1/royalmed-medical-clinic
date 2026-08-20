<?php

namespace Tests\Feature;

use App\Actions\Laboratory\AddLabOrderItemAction;
use App\Actions\Laboratory\CompleteLabOrderAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Laboratory\RecordLabResultAction;
use App\Actions\Laboratory\StartLabOrderAction;
use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use App\Services\LabService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class LaboratoryWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_lab_order_created_with_ordered_status()
    {
        $visit = Visit::factory()->create();
        $action = new CreateLabOrderAction;

        $order = $action->execute([
            'visit_id' => $visit->id,
            'ordered_by' => null,
            'status' => 'ordered',
        ]);

        $this->assertEquals('ordered', $order->status);
        $this->assertNull($order->in_progress_at);
        $this->assertNull($order->completed_at);
    }

    public function test_lab_order_can_be_started_from_ordered_status()
    {
        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $test = LabTest::factory()->create();
        LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $action = new StartLabOrderAction;
        $order = $action->execute($order);

        $this->assertEquals('in_progress', $order->status);
        $this->assertNotNull($order->in_progress_at);
        $this->assertNull($order->completed_at);
    }

    public function test_lab_order_cannot_be_started_from_completed_status()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'completed']);
        $action = new StartLabOrderAction;
        $action->execute($order);
    }

    public function test_lab_order_cannot_be_started_from_in_progress_status()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $action = new StartLabOrderAction;
        $action->execute($order);
    }

    public function test_lab_order_cannot_be_started_without_items()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $action = new StartLabOrderAction;
        $action->execute($order);
    }

    public function test_result_can_be_recorded_for_in_progress_order()
    {
        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $action = new RecordLabResultAction;
        $result = $action->execute([
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);

        $this->assertDatabaseHas('lab_results', [
            'id' => $result->id,
            'lab_order_item_id' => $item->id,
            'lab_test_id' => $test->id,
        ]);
    }

    public function test_result_cannot_be_recorded_for_ordered_order()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $action = new RecordLabResultAction;
        $action->execute([
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);
    }

    public function test_result_cannot_be_recorded_for_completed_order()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'completed']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $action = new RecordLabResultAction;
        $action->execute([
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);
    }

    public function test_duplicate_result_is_prevented()
    {
        $this->expectException(\RuntimeException::class);

        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        // Create first result
        LabResult::factory()->create([
            'lab_order_item_id' => $item->id,
            'lab_test_id' => $test->id,
        ]);

        // Try to create duplicate
        $action = new RecordLabResultAction;
        $action->execute([
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);
    }

    public function test_lab_order_can_be_completed_with_all_results()
    {
        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test1 = LabTest::factory()->create();
        $test2 = LabTest::factory()->create();
        $item1 = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test1->id]);
        $item2 = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test2->id]);

        LabResult::factory()->create(['lab_order_item_id' => $item1->id, 'lab_test_id' => $test1->id]);
        LabResult::factory()->create(['lab_order_item_id' => $item2->id, 'lab_test_id' => $test2->id]);

        $action = new CompleteLabOrderAction;
        $order = $action->execute($order);

        $this->assertEquals('completed', $order->status);
        $this->assertNotNull($order->completed_at);
    }

    public function test_lab_order_cannot_be_completed_without_results()
    {
        $this->expectException(\RuntimeException::class);

        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test = LabTest::factory()->create();
        LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $action = new CompleteLabOrderAction;
        $action->execute($order);
    }

    public function test_lab_order_cannot_be_completed_from_ordered_status()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $action = new CompleteLabOrderAction;
        $action->execute($order);
    }

    public function test_lab_order_cannot_be_completed_twice()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'completed']);
        $action = new CompleteLabOrderAction;
        $action->execute($order);
    }

    public function test_timestamps_are_set_correctly()
    {
        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $test = LabTest::factory()->create();

        // ordered state
        $this->assertNull($order->in_progress_at);
        $this->assertNull($order->completed_at);

        // Start the order
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);
        $startAction = new StartLabOrderAction;
        $order = $startAction->execute($order);

        $this->assertNotNull($order->in_progress_at);
        $this->assertNull($order->completed_at);

        // Add result and complete
        LabResult::factory()->create(['lab_order_item_id' => $item->id, 'lab_test_id' => $test->id]);
        $completeAction = new CompleteLabOrderAction;
        $order = $completeAction->execute($order);

        $this->assertNotNull($order->in_progress_at);
        $this->assertNotNull($order->completed_at);
    }

    public function test_ordered_status_prevents_recording_results()
    {
        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $this->assertFalse($order->canRecordResult());
    }

    public function test_in_progress_status_allows_recording_results()
    {
        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $this->assertTrue($order->canRecordResult());
    }

    public function test_completed_status_prevents_recording_results()
    {
        $order = LabOrder::factory()->create(['status' => 'completed']);
        $this->assertFalse($order->canRecordResult());
    }

    public function test_accession_number_and_specimen_label_are_generated()
    {
        $visit = Visit::factory()->create();
        $createOrderAction = new CreateLabOrderAction;
        $order = $createOrderAction->execute([
            'visit_id' => $visit->id,
            'status' => 'ordered',
        ]);

        $this->assertNotNull($order->accession_number);
        $this->assertStringStartsWith('ACC-', $order->accession_number);

        $test = LabTest::factory()->create(['sample_type' => 'Blood']);
        $addItemAction = new AddLabOrderItemAction;
        $item = $addItemAction->execute([
            'lab_order_id' => $order->id,
            'lab_test_id' => $test->id,
        ]);

        $this->assertNotNull($item->specimen_label);
        $this->assertEquals($order->accession_number, $item->accession_number);
    }

    public function test_sample_lifecycle_transitions_are_enforced()
    {
        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create([
            'lab_order_id' => $order->id,
            'lab_test_id' => $test->id,
            'sample_status' => 'pending',
        ]);

        $labService = app(LabService::class);

        // pending -> collected
        $item = $labService->collectSampleItem($item);
        $this->assertEquals('collected', $item->sample_status);
        $this->assertNotNull($item->sample_collected_at);

        // collected -> received
        $item = $labService->receiveSampleItem($item);
        $this->assertEquals('received', $item->sample_status);
        $this->assertNotNull($item->received_at);

        // received -> processing
        $item = $labService->processSampleItem($item);
        $this->assertEquals('processing', $item->sample_status);
        $this->assertNotNull($item->processing_at);

        // processing -> completed
        $item = $labService->completeSampleItem($item);
        $this->assertEquals('completed', $item->sample_status);
        $this->assertNotNull($item->completed_at);
    }

    public function test_invalid_sample_lifecycle_transition_throws_exception()
    {
        $this->expectException(InvalidLabOrderStatusException::class);

        $order = LabOrder::factory()->create(['status' => 'ordered']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create([
            'lab_order_id' => $order->id,
            'lab_test_id' => $test->id,
            'sample_status' => 'pending',
        ]);

        $labService = app(LabService::class);
        // Trying to process sample directly from pending status should fail
        $labService->processSampleItem($item);
    }

    public function test_critical_result_creates_patient_alert_and_audit_log()
    {
        $patient = Patient::factory()->create();
        $visit = Visit::factory()->create(['patient_id' => $patient->id]);
        $order = LabOrder::factory()->create(['visit_id' => $visit->id, 'status' => 'in_progress']);
        $test = LabTest::factory()->create(['is_critical' => true]);
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id, 'sample_status' => 'completed']);

        $action = new RecordLabResultAction;
        $result = $action->execute([
            'lab_order_item_id' => $item->id,
            'result_value' => 'Critical High',
            'is_critical' => true,
        ]);

        $this->assertTrue((bool) $result->is_critical);

        $this->assertDatabaseHas('patient_alerts', [
            'patient_id' => $patient->id,
            'type' => 'critical_lab_result',
            'severity' => 'critical',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'critical_lab_result_alert',
        ]);
    }

    public function test_lab_test_id_is_automatically_set_from_order_item()
    {
        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $action = new RecordLabResultAction;
        $result = $action->execute([
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);

        $this->assertEquals($test->id, $result->lab_test_id);
        $this->assertEquals($item->lab_test_id, $result->lab_test_id);
    }

    public function test_result_verification_permission_is_enforced()
    {
        Permission::firstOrCreate(['name' => 'laboratory.result', 'guard_name' => 'web']);

        $userWithPerm = User::factory()->create();
        $userWithPerm->givePermissionTo('laboratory.result');

        $userWithoutPerm = User::factory()->create();

        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);
        $result = LabResult::factory()->create(['lab_order_item_id' => $item->id, 'lab_test_id' => $test->id, 'verification_status' => 'pending']);

        // Unauthorized user attempt
        $response = $this->actingAs($userWithoutPerm)
            ->post(route('laboratory.verifyResult', ['labOrder' => $order->id, 'labResult' => $result->id]));
        $response->assertStatus(403);

        // Authorized user attempt
        $response = $this->actingAs($userWithPerm)
            ->post(route('laboratory.verifyResult', ['labOrder' => $order->id, 'labResult' => $result->id]));
        $response->assertRedirect(route('laboratory.show', ['labOrder' => $order->id]));

        $result->refresh();
        $this->assertEquals('verified', $result->verification_status);
        $this->assertEquals($userWithPerm->id, $result->verified_by);
    }

    public function test_result_can_be_rejected_with_reason()
    {
        Permission::firstOrCreate(['name' => 'laboratory.result', 'guard_name' => 'web']);

        $user = User::factory()->create();
        $user->givePermissionTo('laboratory.result');

        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);
        $result = LabResult::factory()->create(['lab_order_item_id' => $item->id, 'lab_test_id' => $test->id, 'verification_status' => 'pending']);

        $response = $this->actingAs($user)
            ->post(route('laboratory.rejectResult', ['labOrder' => $order->id, 'labResult' => $result->id]), [
                'rejection_reason' => 'Sample hemolyzed',
            ]);

        $response->assertRedirect(route('laboratory.show', ['labOrder' => $order->id]));

        $result->refresh();
        $this->assertEquals('rejected', $result->verification_status);
        $this->assertEquals('Sample hemolyzed', $result->rejection_reason);
    }

    public function test_patient_lab_history_returns_chronological_results()
    {
        $patient = Patient::factory()->create();
        $visit = Visit::factory()->create(['patient_id' => $patient->id]);
        $order = LabOrder::factory()->create(['visit_id' => $visit->id, 'status' => 'in_progress']);
        $test = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test->id]);

        $result1 = LabResult::factory()->create([
            'lab_order_item_id' => $item->id,
            'lab_test_id' => $test->id,
            'recorded_at' => now()->subDay(),
        ]);

        $labService = app(LabService::class);
        $history = $labService->getPatientHistory($patient->id);

        $this->assertCount(1, $history->items());
        $this->assertEquals($result1->id, $history->items()[0]->id);
    }
}
