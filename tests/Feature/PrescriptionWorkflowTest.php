<?php

namespace Tests\Feature;

use App\Actions\Prescriptions\CreatePrescriptionWithItemsAction;
use App\Actions\Prescriptions\DispensePrescriptionAction;
use App\Actions\Prescriptions\FinalizePrescriptionAction;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidDispenseQuantityException;
use App\Exceptions\InvalidPrescriptionStatusException;
use App\Exceptions\MedicineExpiredException;
use App\Models\InventoryBatch;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\QueueEntry;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Services\InventoryService;
use Database\Seeders\VisitStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrescriptionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed visit statuses
        $this->seed(VisitStatusSeeder::class);
    }

    public function test_prescription_can_be_created_with_items()
    {
        $visit = Visit::factory()->create();
        $medicine = Medicine::factory()->create();

        $action = new CreatePrescriptionWithItemsAction;
        $prescription = $action->execute([
            'visit_id' => $visit->id,
            'prescribed_by' => null,
            'notes' => 'Test prescription',
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 10.0,
                    'instructions' => 'Take twice daily',
                ],
            ],
        ]);

        $this->assertDatabaseHas('prescriptions', [
            'id' => $prescription->id,
            'visit_id' => $visit->id,
        ]);

        $this->assertDatabaseHas('prescription_items', [
            'prescription_id' => $prescription->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10.0,
        ]);
    }

    public function test_prescription_draft_state()
    {
        $prescription = Prescription::factory()->create(['finalized_at' => null]);

        $this->assertTrue($prescription->isDraft());
        $this->assertFalse($prescription->isFinalized());
        $this->assertFalse($prescription->isDispensed());
    }

    public function test_prescription_can_be_finalized()
    {
        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->count(1), 'items')
            ->create(['finalized_at' => null]);

        $action = new FinalizePrescriptionAction;
        $finalized = $action->execute($prescription);

        $this->assertNotNull($finalized->finalized_at);
        $this->assertNotNull($finalized->prescription_number);
        $this->assertTrue($finalized->isFinalized());
        $this->assertFalse($finalized->isDispensed());
        $this->assertMatchesRegularExpression('/^P-\d{8}-\d{4}$/', $finalized->prescription_number);
    }

    public function test_cannot_finalize_empty_prescription()
    {
        $prescription = Prescription::factory()->create(['finalized_at' => null]);

        $this->assertFalse($prescription->canFinalize());
    }

    public function test_cannot_finalize_already_finalized_prescription()
    {
        $this->expectException(InvalidPrescriptionStatusException::class);

        $prescription = Prescription::factory()->finalized()->create();
        $action = new FinalizePrescriptionAction;
        $action->execute($prescription);
    }

    public function test_cannot_dispense_draft_prescription()
    {
        $this->expectException(InvalidPrescriptionStatusException::class);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->count(1), 'items')
            ->create(['finalized_at' => null]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);
    }

    public function test_cannot_dispense_fully_dispensed_prescription()
    {
        $this->expectException(InvalidPrescriptionStatusException::class);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->count(1), 'items')
            ->dispensed()
            ->create();

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);
    }

    public function test_prescription_can_be_dispensed_with_sufficient_stock()
    {
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $results = $action->execute($prescription);

        $prescription->refresh();
        $this->assertNotNull($prescription->dispensed_at);
        $this->assertTrue($prescription->isFullyDispensed());

        $batch->refresh();
        $this->assertEquals(40.0, $batch->quantity);

        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'quantity' => 10.0,
            'movement_type' => 'out',
        ]);
    }

    public function test_partial_dispensing_behavior()
    {
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 30,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 20.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        // First partial dispense
        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);

        $prescription->refresh();
        $this->assertNotNull($prescription->dispensed_at); // Should be set since fully dispensed
        $this->assertTrue($prescription->isFullyDispensed());

        $batch->refresh();
        $this->assertEquals(10.0, $batch->quantity);
    }

    public function test_cannot_dispense_more_than_prescribed_quantity()
    {
        $this->expectException(InvalidDispenseQuantityException::class);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        // Manually set dispensed_quantity to exceed prescribed using DB
        \DB::table('prescription_items')
            ->where('id', $prescription->items->first()->id)
            ->update(['dispensed_quantity' => 15.0]);

        $prescription->refresh();

        // This should fail because dispensed_quantity (15) > quantity (10)
        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);
    }

    public function test_insufficient_stock_prevents_dispensing()
    {
        $this->expectException(InsufficientStockException::class);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 5,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);
    }

    public function test_expired_medicine_prevents_dispensing()
    {
        $this->expectException(MedicineExpiredException::class);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->expired()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);
    }

    public function test_dispensing_creates_stock_movement_with_user_id()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);

        $movement = StockMovement::where('medicine_id', $medicine->id)->first();
        $this->assertNotNull($movement);
        $this->assertEquals($user->id, $movement->user_id);
    }

    public function test_dispensing_creates_stock_movement_with_prescription_item_reference()
    {
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);

        $movement = StockMovement::where('medicine_id', $medicine->id)->first();
        $this->assertNotNull($movement);
        $this->assertEquals('prescription_item', $movement->reference_type);
        $this->assertEquals($prescription->items->first()->id, $movement->reference_id);
    }

    public function test_fefo_batch_selection()
    {
        $medicine = Medicine::factory()->create();

        // Create batches with different expiry dates
        $olderBatch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 10,
            'expiry_date' => now()->addDays(10),
        ]);

        $newerBatch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 20,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 15.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));
        $action->execute($prescription);

        // Older batch should be depleted first (FEFO)
        $olderBatch->refresh();
        $newerBatch->refresh();

        $this->assertEquals(0.0, $olderBatch->quantity);
        $this->assertEquals(15.0, $newerBatch->quantity);
    }

    public function test_atomic_dispensing_rolls_back_on_failure()
    {
        $medicine1 = Medicine::factory()->create();
        $medicine2 = Medicine::factory()->create();

        $batch1 = InventoryBatch::factory()->create([
            'medicine_id' => $medicine1->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $batch2 = InventoryBatch::factory()->create([
            'medicine_id' => $medicine2->id,
            'quantity' => 5, // Insufficient for second item
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine1->id,
                'quantity' => 10.0,
            ]), 'items')
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine2->id,
                'quantity' => 10.0, // More than available
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $action = new DispensePrescriptionAction(app(InventoryService::class));

        try {
            $action->execute($prescription);
            $this->fail('Should have thrown InsufficientStockException');
        } catch (InsufficientStockException $e) {
            // Expected
        }

        // Both batches should remain unchanged (transaction rolled back)
        $batch1->refresh();
        $batch2->refresh();

        $this->assertEquals(50.0, $batch1->quantity);
        $this->assertEquals(5.0, $batch2->quantity);

        $prescription->refresh();
        $this->assertNull($prescription->dispensed_at);
    }

    public function test_can_add_item_to_draft_prescription()
    {
        $prescription = Prescription::factory()->create(['finalized_at' => null]);
        $this->assertTrue($prescription->canAddItem());
    }

    public function test_cannot_add_item_to_finalized_prescription()
    {
        $prescription = Prescription::factory()->create(['finalized_at' => now()]);
        $this->assertFalse($prescription->canAddItem());
    }

    public function test_is_fully_dispensed_detection()
    {
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
                'dispensed_quantity' => 10.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $this->assertTrue($prescription->isFullyDispensed());
    }

    public function test_is_partially_dispensed_detection()
    {
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
                'dispensed_quantity' => 5.0,
            ]), 'items')
            ->create(['finalized_at' => now()]);

        $this->assertTrue($prescription->isPartiallyDispensed());
        $this->assertFalse($prescription->isFullyDispensed());
    }

    public function test_finalized_prescription_appears_in_pharmacy_queue(): void
    {
        $visit = Visit::factory()->create();
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['visit_id' => $visit->id, 'finalized_at' => null]);

        $action = new FinalizePrescriptionAction;
        $finalized = $action->execute($prescription);

        // Check visit status is WAITING_FOR_PHARMACY
        $waitingForPharmacyStatus = VisitStatus::where('code', 'WAITING_FOR_PHARMACY')->first();
        $this->assertNotNull($waitingForPharmacyStatus);
        $this->assertEquals($waitingForPharmacyStatus->id, $visit->fresh()->visit_status_id);

        // Check pharmacy queue entry was created
        $pharmacyQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->first();

        $this->assertNotNull($pharmacyQueueEntry);
        $this->assertEquals('waiting', $pharmacyQueueEntry->status);
        $this->assertEquals('pharmacy', $pharmacyQueueEntry->department);
        $this->assertEquals($finalized->id, $pharmacyQueueEntry->metadata['prescription_id'] ?? null);
    }

    public function test_dispensed_prescription_disappears_from_pharmacy_queue(): void
    {
        $visit = Visit::factory()->create();
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['visit_id' => $visit->id, 'finalized_at' => null]);

        // Finalize prescription
        $finalizeAction = new FinalizePrescriptionAction;
        $finalizeAction->execute($prescription);

        // Dispense prescription
        $dispenseAction = new DispensePrescriptionAction(app(InventoryService::class));
        $dispenseAction->execute($prescription);

        // Check pharmacy queue entry is completed
        $pharmacyQueueEntry = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->first();

        $this->assertNotNull($pharmacyQueueEntry);
        $this->assertEquals('completed', $pharmacyQueueEntry->status);
        $this->assertNotNull($pharmacyQueueEntry->completed_at);

        // Check visit is no longer in active pharmacy queue
        $activePharmacyEntries = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->whereIn('status', ['waiting', 'called', 'in_progress'])
            ->get();

        $this->assertCount(0, $activePharmacyEntries);
    }

    public function test_dispensing_transitions_visit_to_billing_ready_state(): void
    {
        $visit = Visit::factory()->create();
        $medicine = Medicine::factory()->create();
        $batch = InventoryBatch::factory()->create([
            'medicine_id' => $medicine->id,
            'quantity' => 50,
            'expiry_date' => now()->addDays(30),
        ]);

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['visit_id' => $visit->id, 'finalized_at' => null]);

        // Finalize prescription
        $finalizeAction = new FinalizePrescriptionAction;
        $finalizeAction->execute($prescription);

        // Dispense prescription
        $dispenseAction = new DispensePrescriptionAction(app(InventoryService::class));
        $dispenseAction->execute($prescription);

        // Check visit status is WAITING_FOR_BILLING
        $waitingForBillingStatus = VisitStatus::where('code', 'WAITING_FOR_BILLING')->first();
        $this->assertNotNull($waitingForBillingStatus);
        $this->assertEquals($waitingForBillingStatus->id, $visit->fresh()->visit_status_id);
    }

    public function test_double_finalization_does_not_create_duplicate_pharmacy_queue_entries(): void
    {
        $visit = Visit::factory()->create();
        $medicine = Medicine::factory()->create();

        $prescription = Prescription::factory()
            ->has(PrescriptionItem::factory()->state([
                'medicine_id' => $medicine->id,
                'quantity' => 10.0,
            ]), 'items')
            ->create(['visit_id' => $visit->id, 'finalized_at' => null]);

        $action = new FinalizePrescriptionAction;
        $action->execute($prescription);

        // Try to finalize again - should fail
        $this->expectException(InvalidPrescriptionStatusException::class);
        $action->execute($prescription);

        // Check only one pharmacy queue entry exists
        $pharmacyQueueEntries = QueueEntry::where('visit_id', $visit->id)
            ->where('department', 'pharmacy')
            ->get();

        $this->assertCount(1, $pharmacyQueueEntries);
    }
}
