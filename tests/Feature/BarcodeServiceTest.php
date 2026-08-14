<?php

namespace Tests\Feature;

use App\Models\InventoryBatch;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\Prescription;
use App\Services\BarcodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BarcodeServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BarcodeService $barcodeService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->barcodeService = app(BarcodeService::class);
    }

    public function test_patient_card_barcode_generation(): void
    {
        $patient = Patient::factory()->create(['hospital_number' => 'H-12345678']);

        $barcode = $this->barcodeService->generatePatientCardBarcode($patient);

        $this->assertStringContainsString('CODE128', $barcode);
        $this->assertStringContainsString('H-12345678', $barcode);
    }

    public function test_patient_card_qr_generation(): void
    {
        $patient = Patient::factory()->create(['hospital_number' => 'H-12345678']);

        $qr = $this->barcodeService->generatePatientCardQr($patient);

        $this->assertStringStartsWith('QR:', $qr);
    }

    public function test_qr_code_decoding(): void
    {
        $patient = Patient::factory()->create(['hospital_number' => 'H-12345678']);

        $qr = $this->barcodeService->generatePatientCardQr($patient);
        $decoded = $this->barcodeService->decodeQrCode($qr);

        $this->assertIsArray($decoded);
        $this->assertEquals($patient->id, $decoded['id']);
    }

    public function test_patient_qr_validation(): void
    {
        $patient = Patient::factory()->create(['hospital_number' => 'H-12345678']);

        $qr = $this->barcodeService->generatePatientCardQr($patient);
        $isValid = $this->barcodeService->validatePatientQr($qr, $patient);

        $this->assertTrue($isValid);
    }

    public function test_lab_specimen_barcode_generation(): void
    {
        $labOrder = LabOrder::factory()->create();

        $barcode = $this->barcodeService->generateLabSpecimenBarcode($labOrder);

        $this->assertStringContainsString('CODE128', $barcode);
        $this->assertStringContainsString('LAB', $barcode);
    }

    public function test_prescription_barcode_generation(): void
    {
        $prescription = Prescription::factory()->create();

        $barcode = $this->barcodeService->generatePrescriptionBarcode($prescription);

        $this->assertStringContainsString('CODE128', $barcode);
        $this->assertStringContainsString('RX', $barcode);
    }

    public function test_receipt_barcode_generation(): void
    {
        $invoice = Invoice::factory()->create(['invoice_number' => 'INV-001']);

        $barcode = $this->barcodeService->generateReceiptBarcode($invoice);

        $this->assertStringContainsString('CODE128', $barcode);
        $this->assertStringContainsString('INV-001', $barcode);
    }

    public function test_inventory_batch_barcode_generation(): void
    {
        $batch = InventoryBatch::factory()->create(['batch_number' => 'BATCH-001']);

        $barcode = $this->barcodeService->generateInventoryBatchBarcode($batch);

        $this->assertStringContainsString('CODE128', $barcode);
        $this->assertStringContainsString('BATCH-001', $barcode);
    }

    public function test_deterministic_code_generation(): void
    {
        $code1 = $this->barcodeService->generateDeterministicCode('PATIENT', 123);
        $code2 = $this->barcodeService->generateDeterministicCode('PATIENT', 123);

        $this->assertEquals($code1, $code2);
    }

    public function test_different_types_produce_different_codes(): void
    {
        $code1 = $this->barcodeService->generateDeterministicCode('PATIENT', 123);
        $code2 = $this->barcodeService->generateDeterministicCode('INVOICE', 123);

        $this->assertNotEquals($code1, $code2);
    }
}
