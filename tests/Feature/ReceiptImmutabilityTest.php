<?php

namespace Tests\Feature;

use App\Actions\Payments\RecordPaymentAction;
use App\Models\Invoice;
use App\Models\InvoiceStatus;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptImmutabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function createPayment(array $overrides = []): Payment
    {
        $visit = Visit::factory()->create();
        $unpaidStatus = InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid']);

        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'invoice_number' => 'INV-'.rand(10000, 99999),
            'issued_at' => now(),
        ]);

        // Use server update mode to set protected fields
        Invoice::withServerUpdate(function () use ($invoice, $unpaidStatus) {
            $invoice->update([
                'status_id' => $unpaidStatus->id,
                'total_amount' => 1000,
                'due_amount' => 1000,
            ]);
        });

        $cashMethod = PaymentMethod::where('name', 'cash')->first() ?? PaymentMethod::factory()->create(['name' => 'cash']);

        $data = array_merge([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
        ], $overrides);

        $action = new RecordPaymentAction;

        return $action->execute($data);
    }

    public function test_receipt_number_is_not_mass_assignable()
    {
        $data = [
            'receipt_number' => 'R-MALICIOUS-00001', // Attempt to provide malicious receipt number
        ];

        $payment = $this->createPayment($data);

        // Verify the malicious receipt number was NOT used
        $this->assertNotEquals('R-MALICIOUS-00001', $payment->receipt_number);
        $this->assertMatchesRegularExpression('/^R-\d{8}-\d{5}$/', $payment->receipt_number);
    }

    public function test_receipt_number_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'receipt_number\' cannot be modified after payment creation');

        $payment = $this->createPayment();

        // Refresh to ensure the record exists in database
        $payment->refresh();

        // Attempt to modify receipt number
        $payment->receipt_number = 'R-MALICIOUS-00002';
        $payment->save();
    }

    public function test_mass_assignment_cannot_modify_receipt_number()
    {
        $payment = $this->createPayment(['reference' => 'OLD-REF']);

        $originalReceiptNumber = $payment->receipt_number;

        // Attempt to use fill() with receipt_number
        // Since receipt_number is in fillable, fill() will set it locally
        $payment->fill([
            'receipt_number' => 'R-MALICIOUS-00002',
            'reference' => 'NEW-REF',
        ]);

        // Verify receipt_number was set by fill (because it's in fillable)
        $this->assertEquals('R-MALICIOUS-00002', $payment->receipt_number);

        // But when we try to save, the immutability check should block it
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'receipt_number\' cannot be modified after payment creation');

        $payment->save();
    }

    public function test_receipt_viewing_does_not_modify_payment()
    {
        $payment = $this->createPayment();

        $originalReceiptNumber = $payment->receipt_number;
        $originalAmount = $payment->amount;

        // Simulate receipt viewing (load relationships)
        $payment->load(['invoice.visit.patient', 'invoice.items', 'method', 'mpesaTransaction', 'receivedBy']);

        $payment->refresh();

        $this->assertEquals($originalReceiptNumber, $payment->receipt_number);
        $this->assertEquals($originalAmount, $payment->amount);
    }

    public function test_payment_can_update_other_fields_without_affecting_receipt_number()
    {
        $payment = $this->createPayment(['reference' => 'OLD-REF']);

        $originalReceiptNumber = $payment->receipt_number;

        // Update a different field
        $payment->reference = 'NEW-REF';
        $payment->save();

        $payment->refresh();

        $this->assertEquals($originalReceiptNumber, $payment->receipt_number);
        $this->assertEquals('NEW-REF', $payment->reference);
    }

    public function test_receipt_number_is_generated_server_side()
    {
        $payment = $this->createPayment();

        // Verify receipt number was generated
        $this->assertNotNull($payment->receipt_number);
        $this->assertMatchesRegularExpression('/^R-\d{8}-\d{5}$/', $payment->receipt_number);
    }

    public function test_receipt_number_is_persisted_correctly()
    {
        $payment = $this->createPayment();

        // Refresh from database
        $payment->refresh();

        // Verify receipt number is persisted
        $this->assertNotNull($payment->receipt_number);
        $this->assertMatchesRegularExpression('/^R-\d{8}-\d{5}$/', $payment->receipt_number);

        // Verify it's in the database
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'receipt_number' => $payment->receipt_number,
        ]);
    }

    public function test_receipt_number_remains_unchanged_after_payment_creation()
    {
        $payment = $this->createPayment();

        $originalReceiptNumber = $payment->receipt_number;

        // Refresh multiple times
        $payment->refresh();
        $payment->refresh();

        $this->assertEquals($originalReceiptNumber, $payment->receipt_number);
    }
}
