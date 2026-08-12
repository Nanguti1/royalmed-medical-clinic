<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\InvoiceStatus;
use App\Models\MpesaTransaction;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Visit;
use App\Services\PaymentReconciliationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentReconciliationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PaymentMethodSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\AuthorizationSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\InvoiceStatusSeeder']);
    }

    public function test_reconciliation_page_requires_authorization()
    {
        $user = $this->createUserWithoutPermission('reports.view');

        $response = $this->actingAs($user)
            ->get('/payments/reconciliation');

        $response->assertForbidden();
    }

    public function test_reconciliation_service_calculates_daily_summary()
    {
        $service = new PaymentReconciliationService;
        $date = now()->toDateString();

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        // Create cash payments
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 300,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        // Create M-Pesa payments
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $mpesaMethod->id,
            'amount' => 1000,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $mpesaMethod->id,
            'amount' => 700,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $summary = $service->getDailySummary($date);

        $this->assertEquals(800, $summary['cash_total']);
        $this->assertEquals(1700, $summary['mpesa_total']);
        $this->assertEquals(2500, $summary['total_amount']);
        $this->assertEquals(2, $summary['cash_count']);
        $this->assertEquals(2, $summary['mpesa_count']);
        $this->assertEquals(4, $summary['total_count']);
    }

    public function test_reconciliation_service_filters_by_date()
    {
        $service = new PaymentReconciliationService;
        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        // Create payment for today
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        // Create payment for yesterday
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 300,
            'paid_at' => now()->subDay(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $todaySummary = $service->getDailySummary(now()->toDateString());
        $yesterdaySummary = $service->getDailySummary(now()->subDay()->toDateString());

        $this->assertEquals(500, $todaySummary['cash_total']);
        $this->assertEquals(300, $yesterdaySummary['cash_total']);
    }

    public function test_reconciliation_service_separates_cash_and_mpesa_payments()
    {
        $service = new PaymentReconciliationService;
        $date = now()->toDateString();

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        // Create cash payment
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        // Create M-Pesa payment
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $mpesaMethod->id,
            'amount' => 1000,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $cashPayments = $service->getCashPayments($date);
        $mpesaPayments = $service->getMpesaPayments($date);

        $this->assertCount(1, $cashPayments);
        $this->assertCount(1, $mpesaPayments);
        $this->assertEquals(500, $cashPayments->first()->amount);
        $this->assertEquals(1000, $mpesaPayments->first()->amount);
    }

    public function test_reconciliation_service_calculates_staff_breakdown()
    {
        $service = new PaymentReconciliationService;
        $date = now()->toDateString();

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $user1 = $this->createUserWithPermission('billing.create');
        $user2 = $this->createUserWithPermission('billing.create');

        // User1 payments
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $user1->id,
        ]);

        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $mpesaMethod->id,
            'amount' => 1000,
            'paid_at' => now(),
            'received_by' => $user1->id,
        ]);

        // User2 payments
        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 300,
            'paid_at' => now(),
            'received_by' => $user2->id,
        ]);

        Payment::create([
            'invoice_id' => $this->createInvoice()->id,
            'payment_method_id' => $mpesaMethod->id,
            'amount' => 400,
            'paid_at' => now(),
            'received_by' => $user2->id,
        ]);

        $staffBreakdown = $service->getStaffBreakdown($date);

        $this->assertCount(2, $staffBreakdown);

        $user1Breakdown = $staffBreakdown->firstWhere('user_id', $user1->id);
        $user2Breakdown = $staffBreakdown->firstWhere('user_id', $user2->id);

        $this->assertEquals(1500, $user1Breakdown->total_amount);
        $this->assertEquals(500, $user1Breakdown->cash_total);
        $this->assertEquals(1000, $user1Breakdown->mpesa_total);

        $this->assertEquals(700, $user2Breakdown->total_amount);
        $this->assertEquals(300, $user2Breakdown->cash_total);
        $this->assertEquals(400, $user2Breakdown->mpesa_total);
    }

    public function test_reconciliation_data_includes_payment_relationships()
    {
        $service = new PaymentReconciliationService;
        $date = now()->toDateString();

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoice();

        // Create M-Pesa payment with transaction
        $mpesaTransaction = MpesaTransaction::create([
            'transaction_id' => 'ABC123',
            'phone' => '0712345678',
            'amount' => 1000,
            'status' => 'completed',
            'occurred_at' => now(),
        ]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $mpesaMethod->id,
            'amount' => 1000,
            'paid_at' => now(),
            'mpesa_transaction_id' => $mpesaTransaction->id,
            'received_by' => $user->id,
        ]);

        $reconciliationData = $service->getReconciliationData($date);

        $this->assertArrayHasKey('summary', $reconciliationData);
        $this->assertArrayHasKey('cash_payments', $reconciliationData);
        $this->assertArrayHasKey('mpesa_payments', $reconciliationData);
        $this->assertArrayHasKey('staff_breakdown', $reconciliationData);

        $this->assertNotEmpty($reconciliationData['mpesa_payments']);
        $mpesaPayment = $reconciliationData['mpesa_payments']->first();
        $this->assertNotNull($mpesaPayment->mpesaTransaction);
        $this->assertEquals('ABC123', $mpesaPayment->mpesaTransaction->transaction_id);
    }

    public function test_reconciliation_service_handles_empty_data()
    {
        $service = new PaymentReconciliationService;
        $date = now()->toDateString();

        $summary = $service->getDailySummary($date);
        $cashPayments = $service->getCashPayments($date);
        $mpesaPayments = $service->getMpesaPayments($date);
        $staffBreakdown = $service->getStaffBreakdown($date);

        $this->assertEquals(0, $summary['total_amount']);
        $this->assertEquals(0, $summary['cash_total']);
        $this->assertEquals(0, $summary['mpesa_total']);
        $this->assertEquals(0, $summary['total_count']);

        $this->assertCount(0, $cashPayments);
        $this->assertCount(0, $mpesaPayments);
        $this->assertCount(0, $staffBreakdown);
    }

    protected function createInvoice(): Invoice
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

        return $invoice;
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
