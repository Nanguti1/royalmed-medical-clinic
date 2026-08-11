<?php

namespace Tests\Feature;

use App\Actions\Laboratory\CompleteLabOrderAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Laboratory\RecordLabResultAction;
use App\Actions\Laboratory\StartLabOrderAction;
use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'lab_test_id' => $test->id,
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);

        $this->assertDatabaseHas('lab_results', [
            'id' => $result->id,
            'lab_order_item_id' => $item->id,
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
            'lab_test_id' => $test->id,
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
            'lab_test_id' => $test->id,
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
            'lab_test_id' => $test->id,
            'lab_order_item_id' => $item->id,
            'result_value' => 'Normal',
        ]);
    }

    public function test_result_must_match_order_item_lab_test()
    {
        $this->expectException(\InvalidArgumentException::class);

        $order = LabOrder::factory()->create(['status' => 'in_progress']);
        $test1 = LabTest::factory()->create();
        $test2 = LabTest::factory()->create();
        $item = LabOrderItem::factory()->create(['lab_order_id' => $order->id, 'lab_test_id' => $test1->id]);

        $action = new RecordLabResultAction;
        $action->execute([
            'lab_test_id' => $test2->id, // Different test
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
}
