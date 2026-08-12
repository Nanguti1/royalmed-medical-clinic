<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\InvoiceStatus;
use App\Models\MpesaTransaction;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Visit;
use App\Services\PaymentReceiptService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentReceiptTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PaymentMethodSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\AuthorizationSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\InvoiceStatusSeeder']);
    }

    public function test_receipt_displays_correct_payment()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals($payment->amount, $receiptData['payment']['amount']);
        $this->assertEquals($payment->receipt_number, $receiptData['receipt']['number']);
        $this->assertEquals($payment->id, $receiptData['receipt']['payment_id']);
    }

    public function test_receipt_displays_correct_invoice()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals($payment->invoice->invoice_number, $receiptData['invoice']['number']);
        $this->assertEquals($payment->invoice->total_amount, $receiptData['invoice']['total']);
    }

    public function test_receipt_displays_correct_patient()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $receiptData = $service->getReceiptData($payment);

        $patient = $payment->invoice->visit->patient;
        $expectedName = collect([$patient->first_name, $patient->other_names, $patient->last_name])
            ->filter()
            ->implode(' ');

        $this->assertEquals($expectedName, $receiptData['patient']['name']);
    }

    public function test_receipt_displays_correct_payment_method()
    {
        $service = new PaymentReceiptService;
        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $payment = $this->createPayment(['payment_method_id' => $cashMethod->id]);

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals('cash', $receiptData['payment']['method']);
    }

    public function test_mpesa_receipt_displays_transaction_reference()
    {
        $service = new PaymentReceiptService;
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $mpesaTransaction = MpesaTransaction::create([
            'transaction_id' => 'ABC123XYZ',
            'phone' => '0712345678',
            'amount' => 1000,
            'status' => 'completed',
            'occurred_at' => now(),
        ]);

        $payment = $this->createPayment([
            'payment_method_id' => $mpesaMethod->id,
            'mpesa_transaction_id' => $mpesaTransaction->id,
        ]);

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals('ABC123XYZ', $receiptData['payment']['mpesa_reference']);
    }

    public function test_cash_receipt_does_not_require_mpesa_reference()
    {
        $service = new PaymentReceiptService;
        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $payment = $this->createPayment(['payment_method_id' => $cashMethod->id]);

        $receiptData = $service->getReceiptData($payment);

        $this->assertNull($receiptData['payment']['mpesa_reference']);
    }

    public function test_receipt_displays_correct_received_by_user()
    {
        $service = new PaymentReceiptService;
        $user = $this->createUserWithPermission('billing.create');
        $payment = $this->createPayment(['received_by' => $user->id]);

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals($user->name, $receiptData['payment']['received_by']);
    }

    public function test_receipt_displays_persisted_invoice_total()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals($payment->invoice->total_amount, $receiptData['invoice']['total']);
    }

    public function test_receipt_displays_persisted_payment_amount()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment(['amount' => 500]);

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals(500, $receiptData['payment']['amount']);
    }

    public function test_receipt_displays_correct_outstanding_balance()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment(['amount' => 500]);

        $receiptData = $service->getReceiptData($payment);

        $this->assertEquals(500, $receiptData['invoice']['outstanding']);
    }

    public function test_receipt_generation_does_not_modify_payment()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment(['amount' => 1000]);

        $originalAmount = $payment->amount;
        $originalReference = $payment->reference;

        $service->getReceiptData($payment);

        $payment->refresh();

        $this->assertEquals($originalAmount, $payment->amount);
        $this->assertEquals($originalReference, $payment->reference);
    }

    public function test_receipt_generation_does_not_modify_invoice()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $originalTotal = $payment->invoice->total_amount;
        $originalStatusId = $payment->invoice->status_id;

        $service->getReceiptData($payment);

        $payment->invoice->refresh();

        $this->assertEquals($originalTotal, $payment->invoice->total_amount);
        $this->assertEquals($originalStatusId, $payment->invoice->status_id);
    }

    public function test_receipt_service_is_read_only()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $originalPaymentCount = Payment::count();
        $originalInvoiceCount = Invoice::count();

        $service->getReceiptData($payment);

        $this->assertEquals($originalPaymentCount, Payment::count());
        $this->assertEquals($originalInvoiceCount, Invoice::count());
    }

    public function test_receipt_number_is_generated_on_payment_creation()
    {
        $this->markTestSkipped('SQLite has limited locking support - receipt number generation tested in NumberGenerationTest');
    }

    public function test_receipt_number_is_unique()
    {
        $this->markTestSkipped('SQLite has limited locking support - receipt number generation tested in NumberGenerationTest');
    }

    public function test_receipt_includes_clinic_information()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $receiptData = $service->getReceiptData($payment);

        $this->assertArrayHasKey('clinic', $receiptData);
        $this->assertArrayHasKey('name', $receiptData['clinic']);
        $this->assertArrayHasKey('location', $receiptData['clinic']);
        $this->assertArrayHasKey('phone', $receiptData['clinic']);
        $this->assertArrayHasKey('email', $receiptData['clinic']);
    }

    public function test_receipt_includes_invoice_items()
    {
        $service = new PaymentReceiptService;
        $payment = $this->createPayment();

        $receiptData = $service->getReceiptData($payment);

        $this->assertArrayHasKey('items', $receiptData['invoice']);
        $this->assertIsArray($receiptData['invoice']['items']);
    }

    protected function createPayment(array $overrides = []): Payment
    {
        $visit = Visit::factory()->create();
        $unpaidStatus = InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid']);

        // Use server update mode to set protected fields including invoice_number
        $invoice = Invoice::withServerUpdate(function () use ($visit, $unpaidStatus) {
            return Invoice::create([
                'visit_id' => $visit->id,
                'invoice_number' => 'INV-'.rand(10000, 99999),
                'status_id' => $unpaidStatus->id,
                'total_amount' => 1000,
                'due_amount' => 1000,
                'issued_at' => now(),
            ]);
        });

        // Load the status relationship to avoid null reference errors
        $invoice->load('status');

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $user = $this->createUserWithPermission('billing.create');

        $paymentService = app(PaymentService::class);

        return $paymentService->record(array_merge([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $user->id,
        ], $overrides));
    }

    protected function createUserWithPermission(string $permission)
    {
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        return $user;
    }

    protected function createUserWithoutPermission(string $permission)
    {
        return User::factory()->create();
    }
}
