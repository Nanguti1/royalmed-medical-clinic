<?php

namespace Tests\Feature;

use App\Actions\Inventory\ReceiveStockAction;
use App\Actions\Inventory\RecordStockMovementAction;
use App\Actions\Prescriptions\DispensePrescriptionAction;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\MedicineExpiredException;
use App\Exceptions\PatientAllergyException;
use App\Models\DrugInteraction;
use App\Models\InventoryBatch;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\PatientAllergy;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Visit;
use App\Services\InventoryService;
use App\Services\PrescriptionService;
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

    public function test_dispensing_warns_or_blocks_on_documented_allergy()
    {
        $this->expectException(PatientAllergyException::class);

        $patient = Patient::factory()->create();
        PatientAllergy::create([
            'patient_id' => $patient->id,
            'allergen' => 'Penicillin',
            'severity' => 'severe',
            'is_active' => true,
        ]);

        $visit = Visit::factory()->create(['patient_id' => $patient->id]);
        $prescription = Prescription::factory()->create(['visit_id' => $visit->id, 'finalized_at' => now()]);
        $medicine = Medicine::factory()->create(['name' => 'Amoxicillin Penicillin 500mg']);
        InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 100,
            'expiry_date' => now()->addDays(30),
        ]);

        PrescriptionItem::factory()->create([
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);

        $action = app(DispensePrescriptionAction::class);
        $action->execute($prescription);
    }

    public function test_drug_interaction_warnings_are_generated()
    {
        $med1 = Medicine::factory()->create(['name' => 'Warfarin']);
        $med2 = Medicine::factory()->create(['name' => 'Aspirin']);

        DrugInteraction::create([
            'medicine_id_1' => $med1->id,
            'medicine_id_2' => $med2->id,
            'severity' => 'major',
            'description' => 'Increased risk of severe bleeding',
        ]);

        $service = app(PrescriptionService::class);
        $warnings = $service->checkDrugInteractions([$med1->id, $med2->id]);

        $this->assertCount(1, $warnings);
        $this->assertEquals('major', $warnings[0]['severity']);
        $this->assertStringContainsString('Warfarin', $warnings[0]['message']);
    }

    public function test_controlled_drug_dispensing_writes_register_entries()
    {
        $medicine = Medicine::factory()->create(['name' => 'Morphine 10mg', 'is_controlled' => true]);
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $service = app(InventoryService::class);
        $service->deduct($medicine, 5.0);

        $this->assertDatabaseHas('controlled_drug_register', [
            'medicine_id' => $medicine->id,
            'quantity' => 5.0,
            'transaction_type' => 'dispense',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'controlled_drug_dispense',
        ]);
    }

    public function test_stock_returns_and_adjustments_update_movements_and_audit_logs()
    {
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
        ]);

        $service = app(InventoryService::class);

        // Adjustment
        $adjustment = $service->adjustStock([
            'medicine_id' => $medicine->id,
            'inventory_batch_id' => $batch->id,
            'adjustment_type' => 'addition',
            'quantity' => 20.0,
            'reason' => 'Inventory Count Correction',
        ]);

        $batch->refresh();
        $this->assertEquals(70.0, $batch->quantity);

        $this->assertDatabaseHas('stock_adjustments', [
            'id' => $adjustment->id,
            'adjustment_type' => 'addition',
            'quantity' => 20.0,
        ]);

        // Return
        $service->returnStock([
            'medicine_id' => $medicine->id,
            'inventory_batch_id' => $batch->id,
            'quantity' => 5.0,
            'reason' => 'Unused Return',
        ]);

        $batch->refresh();
        $this->assertEquals(75.0, $batch->quantity);

        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'reference_type' => 'return',
            'quantity' => 5.0,
        ]);
    }

    public function test_low_stock_and_expiry_alerts_are_generated()
    {
        $lowStockMed = Medicine::factory()->create(['name' => 'Low Stock Drug', 'reorder_level' => 50.0]);
        InventoryBatch::factory()->create([
            'medicine_id' => $lowStockMed->id,
            'quantity' => 10.0,
        ]);

        $expiredMed = Medicine::factory()->create(['name' => 'Expired Drug']);
        InventoryBatch::factory()->expired()->create([
            'medicine_id' => $expiredMed->id,
            'quantity' => 20.0,
        ]);

        $service = app(InventoryService::class);
        $alerts = $service->generateInventoryAlerts();

        $types = array_column($alerts, 'type');
        $this->assertContains('low_stock', $types);
        $this->assertContains('expired_stock', $types);
    }
}
