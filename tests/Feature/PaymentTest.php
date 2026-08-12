<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\InvoiceStatus;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed payment methods and authorization
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PaymentMethodSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\AuthorizationSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\InvoiceStatusSeeder']);
    }

    public function test_cash_payment_records_successfully()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'reference' => 'REF-001',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 500,
            'reference' => 'REF-001',
        ]);

        $invoice->refresh();
        $this->assertEquals(500, $invoice->due_amount);
    }

    public function test_cash_payment_full_amount_updates_invoice_status_to_paid()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 1000,
                'paid_at' => now()->toDateString(),
            ]);

        $invoice->refresh();
        $this->assertEquals(0, $invoice->due_amount);
        $this->assertEquals('paid', $invoice->status->code);
    }

    public function test_partial_payment_updates_invoice_status_to_partial()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 400,
                'paid_at' => now()->toDateString(),
            ]);

        $invoice->refresh();
        $this->assertEquals(600, $invoice->due_amount);
        $this->assertEquals('partial', $invoice->status->code);
    }

    public function test_overpayment_is_prevented()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(500);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 600,
                'paid_at' => now()->toDateString(),
            ]);

        $response->assertSessionHasErrors('amount');
        $this->assertDatabaseMissing('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 600,
        ]);

        $invoice->refresh();
        $this->assertEquals(500, $invoice->due_amount);
    }

    public function test_payment_against_paid_invoice_is_prevented()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        // Pay in full
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 1000,
                'paid_at' => now()->toDateString(),
            ]);

        // Try to pay again
        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 100,
                'paid_at' => now()->toDateString(),
            ]);

        $response->assertSessionHasErrors('invoice_id');
    }

    public function test_mpesa_payment_requires_transaction_reference()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $mpesaMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'mpesa' => [
                    'transaction_id' => '',
                    'phone' => '0712345678',
                ],
            ]);

        $response->assertSessionHasErrors('mpesa.transaction_id');
    }

    public function test_mpesa_payment_with_valid_reference_succeeds()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $mpesaMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'mpesa' => [
                    'transaction_id' => 'QGH7K9ABC1',
                    'phone' => '0712345678',
                    'amount' => 500,
                    'status' => 'completed',
                    'occurred_at' => now()->toDateString(),
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('mpesa_transactions', [
            'transaction_id' => 'QGH7K9ABC1',
        ]);
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 500,
        ]);
    }

    public function test_duplicate_mpesa_reference_is_prevented()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice1 = $this->createInvoiceWithBalance(1000);
        $invoice2 = $this->createInvoiceWithBalance(1000);

        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        // First payment
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice1->id,
                'payment_method_id' => $mpesaMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'mpesa' => [
                    'transaction_id' => 'QGH7K9ABC1',
                    'phone' => '0712345678',
                    'amount' => 500,
                    'status' => 'completed',
                    'occurred_at' => now()->toDateString(),
                ],
            ]);

        // Try to use same reference for second payment
        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice2->id,
                'payment_method_id' => $mpesaMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'mpesa' => [
                    'transaction_id' => 'QGH7K9ABC1',
                    'phone' => '0722345678',
                    'amount' => 500,
                    'status' => 'completed',
                    'occurred_at' => now()->toDateString(),
                ],
            ]);

        $response->assertSessionHasErrors('mpesa.transaction_id');
    }

    public function test_mixed_payment_methods_are_supported()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        // Cash payment
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 400,
                'paid_at' => now()->toDateString(),
            ]);

        // M-Pesa payment
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $mpesaMethod->id,
                'amount' => 600,
                'paid_at' => now()->toDateString(),
                'mpesa' => [
                    'transaction_id' => 'QGH7K9ABC2',
                    'phone' => '0712345678',
                    'amount' => 600,
                    'status' => 'completed',
                    'occurred_at' => now()->toDateString(),
                ],
            ]);

        $invoice->refresh();
        $this->assertEquals(0, $invoice->due_amount);
        $this->assertEquals('paid', $invoice->status->code);
        $this->assertEquals(2, $invoice->payments()->count());
    }

    public function test_payment_requires_authorization()
    {
        $user = $this->createUserWithoutPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
            ]);

        $response->assertForbidden();
    }

    public function test_invoice_status_resolver_calculates_correct_status()
    {
        $invoice = $this->createInvoiceWithBalance(1000);

        // Initially unpaid
        $this->assertEquals('unpaid', $invoice->status->code);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $user = $this->createUserWithPermission('billing.create');

        // Partial payment
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 400,
                'paid_at' => now()->toDateString(),
            ]);

        $invoice->refresh();
        $this->assertEquals('partial', $invoice->status->code);

        // Full payment
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 600,
                'paid_at' => now()->toDateString(),
            ]);

        $invoice->refresh();
        $this->assertEquals('paid', $invoice->status->code);
    }

    public function test_payment_amount_must_be_positive()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 0,
                'paid_at' => now()->toDateString(),
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_payment_against_cancelled_invoice_is_prevented()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createCancelledInvoice();

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

    public function test_cash_payment_does_not_require_mpesa_reference()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'reference' => 'REF-001',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 500,
            'reference' => 'REF-001',
        ]);
    }

    public function test_payment_sets_received_by_user()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
            ]);

        $payment = Payment::where('invoice_id', $invoice->id)->first();
        $this->assertEquals($user->id, $payment->received_by);
    }

    public function test_payment_creation_is_transactional()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        // Record initial payment count
        $initialPaymentCount = Payment::count();

        // This should succeed atomically
        $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
            ]);

        // Verify payment was created
        $this->assertEquals($initialPaymentCount + 1, Payment::count());

        // Verify invoice balance was updated
        $invoice->refresh();
        $this->assertEquals(500, $invoice->due_amount);

        // Verify invoice status was updated
        $this->assertEquals('partial', $invoice->status->code);
    }

    public function test_payment_pages_return_inertia_responses()
    {
        $user = $this->createUserWithPermission('billing.view');
        $invoice = $this->createInvoiceWithBalance(1000);

        // Test create page - needs billing.create permission
        $userWithCreate = $this->createUserWithPermission('billing.create');
        $response = $this->actingAs($userWithCreate)
            ->get("/payments/create/{$invoice->id}");

        $response->assertInertia(function ($page) {
            $page->component('payments/create');
        });

        // Create a payment first
        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $userWithCreate->id,
        ]);

        // Test show page - needs billing.view permission
        $response = $this->actingAs($user)
            ->get("/payments/{$payment->id}");

        $response->assertInertia(function ($page) {
            $page->component('payments/show');
        });
    }

    public function test_payment_amount_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'amount\' cannot be modified after payment creation');

        $payment = Payment::create([
            'invoice_id' => $this->createInvoiceWithBalance(1000)->id,
            'payment_method_id' => PaymentMethod::where('name', 'cash')->first()->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $payment->amount = 1000;
        $payment->save();
    }

    public function test_payment_invoice_id_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'invoice_id\' cannot be modified after payment creation');

        $invoice1 = $this->createInvoiceWithBalance(1000);
        $invoice2 = $this->createInvoiceWithBalance(1000);

        $payment = Payment::create([
            'invoice_id' => $invoice1->id,
            'payment_method_id' => PaymentMethod::where('name', 'cash')->first()->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $payment->invoice_id = $invoice2->id;
        $payment->save();
    }

    public function test_payment_paid_at_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'paid_at\' cannot be modified after payment creation');

        $payment = Payment::create([
            'invoice_id' => $this->createInvoiceWithBalance(1000)->id,
            'payment_method_id' => PaymentMethod::where('name', 'cash')->first()->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $payment->paid_at = now()->addDay();
        $payment->save();
    }

    public function test_payment_received_by_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'received_by\' cannot be modified after payment creation');

        $user1 = $this->createUserWithPermission('billing.create');
        $user2 = $this->createUserWithPermission('billing.create');

        $payment = Payment::create([
            'invoice_id' => $this->createInvoiceWithBalance(1000)->id,
            'payment_method_id' => PaymentMethod::where('name', 'cash')->first()->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $user1->id,
        ]);

        $payment->received_by = $user2->id;
        $payment->save();
    }

    public function test_payment_receipt_number_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'receipt_number\' cannot be modified after payment creation');

        $payment = Payment::create([
            'invoice_id' => $this->createInvoiceWithBalance(1000)->id,
            'payment_method_id' => PaymentMethod::where('name', 'cash')->first()->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $payment->receipt_number = 'R-FAKE-12345';
        $payment->save();
    }

    public function test_payment_method_id_cannot_be_modified_after_creation()
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Payment field \'payment_method_id\' cannot be modified after payment creation');

        $cashMethod = PaymentMethod::where('name', 'cash')->first();
        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $payment = Payment::create([
            'invoice_id' => $this->createInvoiceWithBalance(1000)->id,
            'payment_method_id' => $cashMethod->id,
            'amount' => 500,
            'paid_at' => now(),
            'received_by' => $this->createUserWithPermission('billing.create')->id,
        ]);

        $payment->payment_method_id = $mpesaMethod->id;
        $payment->save();
    }

    public function test_future_payment_date_is_rejected()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $cashMethod = PaymentMethod::where('name', 'cash')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $cashMethod->id,
                'amount' => 500,
                'paid_at' => now()->addDay()->toDateString(),
            ]);

        $response->assertSessionHasErrors('paid_at');
    }

    public function test_mpesa_amount_must_match_payment_amount()
    {
        $user = $this->createUserWithPermission('billing.create');
        $invoice = $this->createInvoiceWithBalance(1000);

        $mpesaMethod = PaymentMethod::where('name', 'mpesa')->first();

        $response = $this->actingAs($user)
            ->post('/payments', [
                'invoice_id' => $invoice->id,
                'payment_method_id' => $mpesaMethod->id,
                'amount' => 500,
                'paid_at' => now()->toDateString(),
                'mpesa' => [
                    'transaction_id' => 'ABC123',
                    'phone' => '0712345678',
                    'amount' => 600, // Different from payment amount
                    'status' => 'completed',
                    'occurred_at' => now()->toDateString(),
                ],
            ]);

        $response->assertSessionHasErrors('amount');
    }

    protected function createInvoiceWithBalance(float $amount): Invoice
    {
        $visit = Visit::factory()->create();

        $unpaidStatus = InvoiceStatus::firstOrCreate(['code' => 'unpaid'], ['name' => 'Unpaid']);

        // Use server update mode to set protected fields including invoice_number
        $invoice = Invoice::withServerUpdate(function () use ($visit, $unpaidStatus, $amount) {
            return Invoice::create([
                'visit_id' => $visit->id,
                'invoice_number' => 'INV-'.rand(10000, 99999),
                'status_id' => $unpaidStatus->id,
                'total_amount' => $amount,
                'due_amount' => $amount,
                'issued_at' => now(),
            ]);
        });

        // Load the status relationship to avoid null reference errors
        $invoice->load('status');

        return $invoice;
    }

    protected function createCancelledInvoice(): Invoice
    {
        $visit = Visit::factory()->create();

        $cancelledStatus = InvoiceStatus::firstOrCreate(['code' => 'cancelled'], ['name' => 'Cancelled']);

        // Use server update mode to set protected fields including invoice_number
        $invoice = Invoice::withServerUpdate(function () use ($visit, $cancelledStatus) {
            return Invoice::create([
                'visit_id' => $visit->id,
                'invoice_number' => 'INV-'.rand(10000, 99999),
                'status_id' => $cancelledStatus->id,
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
