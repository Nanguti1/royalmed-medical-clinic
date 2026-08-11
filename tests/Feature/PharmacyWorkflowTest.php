<?php

namespace Tests\Feature;

use App\Actions\Inventory\ReceiveStockAction;
use App\Actions\Inventory\RecordStockMovementAction;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\MedicineExpiredException;
use App\Models\InventoryBatch;
use App\Models\Medicine;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PharmacyWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_receiving_stock_creates_inventory_batch()
    {
        $medicine = Medicine::factory()->create();
        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $batch = $service->receive([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH001',
            'expiry_date' => now()->addDays(30),
            'quantity' => 100,
            'purchase_price' => 50.0,
            'supplier_id' => null,
            'received_at' => now(),
        ]);

        $this->assertDatabaseHas('inventory_batches', [
            'id' => $batch->id,
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH001',
            'quantity' => 100,
        ]);
    }

    public function test_receiving_stock_creates_stock_movement()
    {
        $medicine = Medicine::factory()->create();
        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $batch = $service->receive([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH001',
            'expiry_date' => now()->addDays(30),
            'quantity' => 100,
            'purchase_price' => 50.0,
            'supplier_id' => null,
            'received_at' => now(),
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'inventory_batch_id' => $batch->id,
            'quantity' => 100,
            'movement_type' => 'in',
        ]);
    }

    public function test_receiving_stock_captures_user_id()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $medicine = Medicine::factory()->create();
        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->receive([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH001',
            'expiry_date' => now()->addDays(30),
            'quantity' => 100,
            'purchase_price' => 50.0,
            'supplier_id' => null,
            'received_at' => now(),
        ]);

        $movement = StockMovement::where('medicine_id', $medicine->id)->first();
        $this->assertEquals($user->id, $movement->user_id);
    }

    public function test_stock_deduction_reduces_batch_quantity()
    {
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 25.0);

        $batch->refresh();
        $this->assertEquals(75.0, $batch->quantity);
    }

    public function test_stock_deduction_creates_out_movement()
    {
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 25.0);

        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'quantity' => 25.0,
            'movement_type' => 'out',
        ]);
    }

    public function test_stock_deduction_captures_user_id()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 25.0);

        $movement = StockMovement::where('medicine_id', $medicine->id)
            ->where('movement_type', 'out')
            ->first();
        $this->assertEquals($user->id, $movement->user_id);
    }

    public function test_insufficient_stock_exception()
    {
        $this->expectException(InsufficientStockException::class);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 10,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 25.0);
    }

    public function test_expired_medicine_exception()
    {
        $this->expectException(MedicineExpiredException::class);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->expired()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 25.0);
    }

    public function test_fefo_uses_earliest_expiry_first()
    {
        $medicine = Medicine::factory()->create();

        $olderBatch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 30,
            'expiry_date' => now()->addDays(10),
        ]);

        $newerBatch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(60),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 40.0);

        $olderBatch->refresh();
        $newerBatch->refresh();

        $this->assertEquals(0.0, $olderBatch->quantity);
        $this->assertEquals(40.0, $newerBatch->quantity);
    }

    public function test_multiple_stock_deduction()
    {
        $medicine1 = Medicine::factory()->create();
        $medicine2 = Medicine::factory()->create();

        $batch1 = InventoryBatch::factory()->create([
            'medicine_id' => $medicine1->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        $batch2 = InventoryBatch::factory()->create([
            'medicine_id' => $medicine2->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $results = $service->deductMultiple([
            ['medicine_id' => $medicine1->id, 'quantity' => 25.0],
            ['medicine_id' => $medicine2->id, 'quantity' => 15.0],
        ]);

        $batch1->refresh();
        $batch2->refresh();

        $this->assertEquals(75.0, $batch1->quantity);
        $this->assertEquals(35.0, $batch2->quantity);
    }

    public function test_batch_depletion_detection()
    {
        $batch = InventoryBatch::factory()->create([
            'quantity' => 0,
        ]);

        $this->assertTrue($batch->isDepleted());
    }

    public function test_batch_expiry_detection()
    {
        $expiredBatch = InventoryBatch::factory()->expired()->create();
        $validBatch = InventoryBatch::factory()->create();

        $this->assertTrue($expiredBatch->isExpired());
        $this->assertFalse($validBatch->isExpired());
    }

    public function test_batch_has_stock_detection()
    {
        $batch = InventoryBatch::factory()->create([
            'quantity' => 50,
        ]);

        $this->assertTrue($batch->hasStock(25.0));
        $this->assertFalse($batch->hasStock(75.0));
    }

    public function test_expired_batches_are_skipped_in_fefo()
    {
        $medicine = Medicine::factory()->create();

        $expiredBatch = InventoryBatch::factory()->expired()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 30,
        ]);

        $validBatch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = new InventoryService(
            app(ReceiveStockAction::class),
            app(RecordStockMovementAction::class)
        );

        $service->deduct($medicine, 25.0);

        $expiredBatch->refresh();
        $validBatch->refresh();

        // Expired batch should remain unchanged
        $this->assertEquals(30.0, $expiredBatch->quantity);
        $this->assertEquals(25.0, $validBatch->quantity);
    }
}
