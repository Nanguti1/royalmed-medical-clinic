<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceStatus;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Visit;
use App\Services\BillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PaymentMethodSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\AuthorizationSeeder']);
    }

    public function test_invoice_creation_generates_server_side_number()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                [
                    'description' => 'Consultation Fee',
                    'quantity' => 1,
                    'unit_price' => 500,
                ],
            ],
        ]);

        $this->assertNotNull($invoice->invoice_number);
        $this->assertMatchesRegularExpression('/^I-\d{8}-\d{5}$/', $invoice->invoice_number);
    }

    public function test_invoice_number_is_unique()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit1 = Visit::factory()->create();
        $visit2 = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice1 = $billingService->createInvoice([
            'visit_id' => $visit1->id,
            'items' => [
                ['description' => 'Service 1', 'quantity' => 1, 'unit_price' => 500],
            ],
        ]);

        $invoice2 = $billingService->createInvoice([
            'visit_id' => $visit2->id,
            'items' => [
                ['description' => 'Service 2', 'quantity' => 1, 'unit_price' => 500],
            ],
        ]);

        $this->assertNotEquals($invoice1->invoice_number, $invoice2->invoice_number);
    }

    public function test_invoice_totals_are_server_calculated()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Item 1', 'quantity' => 2, 'unit_price' => 100],
                ['description' => 'Item 2', 'quantity' => 3, 'unit_price' => 50],
            ],
        ]);

        // Subtotal: (2 * 100) + (3 * 50) = 200 + 150 = 350
        // Tax (16%): 350 * 0.16 = 56
        // Total: 350 + 56 = 406
        $this->assertEquals(406.00, $invoice->total_amount);
    }

    public function test_invoice_item_total_is_server_calculated()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Item 1', 'quantity' => 5, 'unit_price' => 100],
            ],
        ]);

        $item = $invoice->items->first();
        $this->assertEquals(500.00, $item->total_price);
    }

    public function test_invoice_item_requires_positive_quantity()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $response = $this->actingAs($user)
            ->post('/billing', [
                'visit_id' => $visit->id,
                'items' => [
                    ['description' => 'Item 1', 'quantity' => 0, 'unit_price' => 100],
                ],
            ]);

        $response->assertSessionHasErrors('items.0.quantity');
    }

    public function test_invoice_item_allows_zero_unit_price()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Complimentary Item', 'quantity' => 1, 'unit_price' => 0],
            ],
        ]);

        $this->assertEquals(0.00, $invoice->total_amount);
    }

    public function test_invoice_status_transitions_unpaid_to_partial()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 1000],
            ],
        ]);

        $this->assertEquals('unpaid', $invoice->status->code);

        // Make partial payment
        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $user->id,
        ]);

        $invoice->refresh();
        $this->assertEquals('partial', $invoice->status->code);
    }

    public function test_invoice_status_transitions_partial_to_paid()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 1000],
            ],
        ]);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        // Partial payment
        Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $user->id,
        ]);

        $invoice->refresh();
        $this->assertEquals('partial', $invoice->status->code);

        // Full payment
        Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $user->id,
        ]);

        $invoice->refresh();
        $this->assertEquals('paid', $invoice->status->code);
    }

    public function test_invoice_status_transitions_unpaid_to_paid()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 1000],
            ],
        ]);

        $this->assertEquals('unpaid', $invoice->status->code);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 1000,
            'paid_at' => now(),
            'received_by' => $user->id,
        ]);

        $invoice->refresh();
        $this->assertEquals('paid', $invoice->status->code);
    }

    public function test_cancelled_invoice_cannot_receive_payment()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $cancelledStatus = InvoiceStatus::firstOrCreate(['code' => 'cancelled'], ['name' => 'Cancelled']);

        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'issued_at' => now(),
        ]);

        // Use DB::table to bypass fillable for test helper
        \DB::table('invoices')
            ->where('id', $invoice->id)
            ->update([
                'invoice_number' => 'INV-'.rand(10000, 99999),
                'status_id' => $cancelledStatus->id,
                'total_amount' => 1000,
                'due_amount' => 1000,
            ]);

        $invoice->refresh();

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
            ]);

        $response->assertSessionHasErrors('invoice_id');
    }

    public function test_cancelled_invoice_status_remains_cancelled_on_payment_attempt()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $cancelledStatus = InvoiceStatus::firstOrCreate(['code' => 'cancelled'], ['name' => 'Cancelled']);

        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'issued_at' => now(),
        ]);

        // Use DB::table to bypass fillable for test helper
        \DB::table('invoices')
            ->where('id', $invoice->id)
            ->update([
                'invoice_number' => 'INV-'.rand(10000, 99999),
                'status_id' => $cancelledStatus->id,
                'total_amount' => 1000,
                'due_amount' => 1000,
            ]);

        $invoice->refresh();

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
            ]);

        $invoice->refresh();
        $this->assertEquals('cancelled', $invoice->status->code);
    }

    public function test_invoice_due_amount_is_authoritative()
    {
        $user = $this->createUserWithPermission('billing.create');
        $visit = Visit::factory()->create();

        $billingService = app(BillingService::class);

        $invoice = $billingService->createInvoice([
            'visit_id' => $visit->id,
            'items' => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 1000],
            ],
        ]);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 300,
            'paid_at' => now(),
            'received_by' => $user->id,
        ]);

        $invoice->refresh();
        $this->assertEquals(700.00, $invoice->due_amount);
    }

    public function test_invoice_number_protected_from_modification()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Invoice field \'invoice_number\' cannot be modified after invoice creation');

        $visit = Visit::factory()->create();

        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'issued_at' => now(),
        ]);

        // Use DB::table to bypass fillable for test setup
        \DB::table('invoices')
            ->where('id', $invoice->id)
            ->update([
                'invoice_number' => 'INV-12345',
                'status_id' => InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid'])->id,
                'total_amount' => 1000,
                'due_amount' => 1000,
            ]);

        $invoice->refresh();

        // Try to modify invoice_number
        $invoice->invoice_number = 'INV-FAKE';
        $invoice->save();
    }

    public function test_invoice_item_total_price_protected_from_modification()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Invoice item total_price cannot be modified after creation');

        $visit = Visit::factory()->create();

        $invoice = Invoice::create([
            'visit_id' => $visit->id,
            'issued_at' => now(),
        ]);

        // Use DB::table to bypass fillable for test setup
        \DB::table('invoices')
            ->where('id', $invoice->id)
            ->update([
                'invoice_number' => 'INV-12345',
                'status_id' => InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid'])->id,
                'total_amount' => 1000,
                'due_amount' => 1000,
            ]);

        $invoice->refresh();

        $item = InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Test Item',
            'quantity' => 10,
            'unit_price' => 100,
            'total_price' => 1000,
        ]);

        // Try to modify total_price
        $item->total_price = 999999;
        $item->save();
    }

    protected function createUserWithPermission(string $permission)
    {
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        return $user;
    }
}
