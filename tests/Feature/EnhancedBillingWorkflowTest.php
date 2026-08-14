<?php

namespace Tests\Feature;

use App\Models\CreditNote;
use App\Models\Deposit;
use App\Models\Discount;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\Refund;
use App\Services\BillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnhancedBillingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected BillingService $billingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->billingService = app(BillingService::class);
    }

    public function test_credit_note_can_be_created(): void
    {
        $invoice = Invoice::factory()->create();

        $creditNote = $this->billingService->createCreditNote($invoice, [
            'reason' => 'refund',
            'amount' => 5000,
            'tax_amount' => 500,
            'description' => 'Service cancellation',
            'issued_by' => 1,
        ]);

        $this->assertDatabaseHas('credit_notes', [
            'invoice_id' => $invoice->id,
            'reason' => 'refund',
            'amount' => 5000,
        ]);

        $this->assertEquals(5500, $creditNote->total_amount);
        $this->assertNotNull($creditNote->credit_note_number);
    }

    public function test_credit_note_can_be_applied(): void
    {
        $creditNote = CreditNote::factory()->create([
            'status' => 'issued',
            'approved_at' => now(),
        ]);

        $this->billingService->applyCreditNote($creditNote, 1);

        $this->assertEquals('applied', $creditNote->fresh()->status);
        $this->assertNotNull($creditNote->applied_date);
    }

    public function test_credit_note_cannot_be_applied_without_approval(): void
    {
        $creditNote = CreditNote::factory()->create([
            'status' => 'issued',
            'approved_at' => null,
        ]);

        $this->expectException(\RuntimeException::class);

        $this->billingService->applyCreditNote($creditNote, 1);
    }

    public function test_refund_can_be_created(): void
    {
        $payment = Payment::factory()->create(['amount' => 10000]);

        $refund = $this->billingService->createRefund($payment, [
            'reason' => 'overpayment',
            'amount' => 2000,
            'requested_by' => 1,
        ]);

        $this->assertDatabaseHas('refunds', [
            'payment_id' => $payment->id,
            'reason' => 'overpayment',
            'amount' => 2000,
            'status' => 'pending',
        ]);

        $this->assertEquals(2000, $payment->fresh()->refund_amount);
    }

    public function test_refund_can_be_approved(): void
    {
        $refund = Refund::factory()->create(['status' => 'pending']);

        $refund->approve(1);

        $this->assertEquals('approved', $refund->fresh()->status);
        $this->assertNotNull($refund->approved_date);
    }

    public function test_refund_can_be_processed(): void
    {
        $refund = Refund::factory()->create(['status' => 'approved']);

        $refund->process(1);

        $this->assertEquals('processed', $refund->fresh()->status);
        $this->assertNotNull($refund->processed_date);
    }

    public function test_refund_can_be_rejected(): void
    {
        $refund = Refund::factory()->create(['status' => 'pending']);

        $refund->reject('Invalid request', 1);

        $this->assertEquals('rejected', $refund->fresh()->status);
        $this->assertEquals('Invalid request', $refund->rejection_reason);
    }

    public function test_deposit_can_be_created(): void
    {
        $payment = Payment::factory()->create();
        $patient = $payment->invoice->visit->patient;

        $deposit = $this->billingService->createDeposit([
            'patient_id' => $patient->id,
            'payment_id' => $payment->id,
            'amount' => 10000,
        ]);

        $this->assertDatabaseHas('deposits', [
            'patient_id' => $patient->id,
            'payment_id' => $payment->id,
            'amount' => 10000,
            'status' => 'active',
        ]);

        $this->assertEquals(10000, $deposit->remaining_amount);
        $this->assertNotNull($deposit->deposit_number);
    }

    public function test_deposit_can_be_allocated(): void
    {
        $patient = Patient::factory()->create();
        $deposit = Deposit::factory()->create([
            'patient_id' => $patient->id,
            'amount' => 10000,
            'remaining_amount' => 10000,
        ]);

        $payment = Payment::factory()->create(['amount' => 5000]);
        $invoice = Invoice::factory()->create();

        $this->billingService->allocateDeposit($deposit, $payment, $invoice, 5000);

        $this->assertEquals(5000, $deposit->fresh()->used_amount);
        $this->assertEquals(5000, $deposit->fresh()->remaining_amount);

        $this->assertDatabaseHas('deposit_allocations', [
            'deposit_id' => $deposit->id,
            'payment_id' => $payment->id,
            'invoice_id' => $invoice->id,
            'amount' => 5000,
        ]);
    }

    public function test_deposit_cannot_be_overallocated(): void
    {
        $deposit = Deposit::factory()->create([
            'amount' => 5000,
            'remaining_amount' => 5000,
        ]);

        $payment = Payment::factory()->create();
        $invoice = Invoice::factory()->create();

        $this->expectException(\RuntimeException::class);

        $this->billingService->allocateDeposit($deposit, $payment, $invoice, 10000);
    }

    public function test_deposit_status_changes_when_exhausted(): void
    {
        $deposit = Deposit::factory()->create([
            'amount' => 5000,
            'remaining_amount' => 5000,
        ]);

        $payment = Payment::factory()->create();
        $invoice = Invoice::factory()->create();

        $this->billingService->allocateDeposit($deposit, $payment, $invoice, 5000);

        $this->assertEquals('exhausted', $deposit->fresh()->status);
    }

    public function test_payment_plan_can_be_created(): void
    {
        $invoice = Invoice::factory()->create([
            'total_amount' => 12000,
            'due_amount' => 12000,
        ]);

        $plan = $this->billingService->createPaymentPlan($invoice, [
            'installment_count' => 3,
            'frequency' => 'monthly',
            'start_date' => now(),
        ]);

        $this->assertDatabaseHas('payment_plans', [
            'invoice_id' => $invoice->id,
            'total_amount' => 12000,
            'installment_count' => 3,
            'status' => 'active',
        ]);

        $this->assertEquals(4000, $plan->installment_amount);
    }

    public function test_payment_plan_installment_can_be_processed(): void
    {
        $plan = PaymentPlan::factory()->create([
            'total_amount' => 12000,
            'paid_amount' => 0,
            'remaining_amount' => 12000,
            'installment_count' => 3,
        ]);

        PaymentPlanInstallment::factory()->create([
            'payment_plan_id' => $plan->id,
            'amount' => 4000,
            'status' => 'pending',
        ]);

        $payment = Payment::factory()->create(['amount' => 4000]);

        $updatedPlan = $this->billingService->processPaymentPlanInstallment($plan, 4000, $payment->id);

        $this->assertEquals(4000, $updatedPlan->paid_amount);
        $this->assertEquals(8000, $updatedPlan->remaining_amount);
        $this->assertEquals(1, $updatedPlan->completed_installments);
    }

    public function test_payment_plan_completes_when_fully_paid(): void
    {
        $plan = PaymentPlan::factory()->create([
            'total_amount' => 12000,
            'paid_amount' => 8000,
            'remaining_amount' => 4000,
            'installment_count' => 3,
            'completed_installments' => 2,
        ]);

        PaymentPlanInstallment::factory()->create([
            'payment_plan_id' => $plan->id,
            'amount' => 4000,
            'status' => 'pending',
        ]);

        $payment = Payment::factory()->create(['amount' => 4000]);

        $updatedPlan = $this->billingService->processPaymentPlanInstallment($plan, 4000, $payment->id);

        $this->assertEquals('completed', $updatedPlan->status);
        $this->assertEquals(12000, $updatedPlan->paid_amount);
        $this->assertEquals(0, $updatedPlan->remaining_amount);
    }

    public function test_discount_can_be_applied_to_invoice(): void
    {
        $invoice = Invoice::factory()->create([
            'total_amount' => 10000,
            'due_amount' => 10000,
        ]);

        $discount = Discount::factory()->create([
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
            'valid_from' => now()->subMonth(),
            'valid_to' => now()->addMonth(),
        ]);

        $updatedInvoice = $this->billingService->applyDiscountToInvoice($invoice, $discount);

        $this->assertEquals(1000, $updatedInvoice->discount_amount);
        $this->assertEquals(9000, $updatedInvoice->due_amount);
        $this->assertEquals($discount->id, $updatedInvoice->discount_id);
    }

    public function test_fixed_discount_can_be_applied(): void
    {
        $invoice = Invoice::factory()->create([
            'total_amount' => 10000,
            'due_amount' => 10000,
        ]);

        $discount = Discount::factory()->create([
            'type' => 'fixed',
            'value' => 500,
            'max_discount_amount' => null,
            'is_active' => true,
        ]);

        $updatedInvoice = $this->billingService->applyDiscountToInvoice($invoice, $discount);

        $this->assertEquals(500, $updatedInvoice->discount_amount);
        $this->assertEquals(9500, $updatedInvoice->due_amount);
    }

    public function test_invalid_discount_cannot_be_applied(): void
    {
        $invoice = Invoice::factory()->create([
            'total_amount' => 10000,
        ]);

        $discount = Discount::factory()->create([
            'type' => 'percentage',
            'value' => 10,
            'is_active' => false,
        ]);

        $this->expectException(\RuntimeException::class);

        $this->billingService->applyDiscountToInvoice($invoice, $discount);
    }

    public function test_card_payment_can_be_recorded(): void
    {
        $invoice = Invoice::factory()->create();

        $payment = $this->billingService->recordCardPayment([
            'invoice_id' => $invoice->id,
            'amount' => 5000,
            'card_number' => '4242424242424242',
            'card_type' => 'visa',
            'transaction_id' => 'TXN123456',
        ], 1);

        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 5000,
            'card_last_four' => '4242',
            'card_type' => 'visa',
            'transaction_id' => 'TXN123456',
        ]);
    }

    public function test_split_payment_can_be_recorded(): void
    {
        $invoice = Invoice::factory()->create();

        $payments = $this->billingService->recordSplitPayment($invoice, [
            [
                'payment_method_id' => 1,
                'amount' => 3000,
            ],
            [
                'payment_method_id' => 2,
                'amount' => 2000,
            ],
        ]);

        $this->assertCount(2, $payments);
        $this->assertEquals(3000, $payments[0]->amount);
        $this->assertEquals(2000, $payments[1]->amount);
    }

    public function test_outstanding_balance_report(): void
    {
        Invoice::factory()->count(5)->create(['due_amount' => 10000, 'is_insurance_claim' => false]);
        Invoice::factory()->count(3)->create(['due_amount' => 15000, 'is_insurance_claim' => true]);
        PaymentPlan::factory()->count(2)->create(['status' => 'active']);
        PaymentPlan::factory()->count(1)->create(['status' => 'active', 'next_payment_date' => now()->subDay()]);
        Deposit::factory()->count(4)->create(['remaining_amount' => 5000, 'status' => 'active']);

        $report = $this->billingService->getOutstandingBalanceReport();

        $this->assertEquals(50000, $report['total_outstanding']);
        $this->assertEquals(45000, $report['insurance_outstanding']);
        $this->assertEquals(2, $report['payment_plans_active']);
        $this->assertEquals(1, $report['payment_plans_overdue']);
        $this->assertEquals(20000, $report['deposits_active']);
    }

    public function test_payment_plan_can_be_cancelled(): void
    {
        $plan = PaymentPlan::factory()->create(['status' => 'active']);

        $plan->cancel();

        $this->assertEquals('cancelled', $plan->fresh()->status);
    }

    public function test_completed_payment_plan_cannot_be_cancelled(): void
    {
        $plan = PaymentPlan::factory()->create(['status' => 'completed']);

        $this->expectException(\RuntimeException::class);

        $plan->cancel();
    }

    public function test_deposit_can_be_refunded(): void
    {
        $deposit = Deposit::factory()->create(['status' => 'active']);

        $deposit->refund();

        $this->assertEquals('refunded', $deposit->fresh()->status);
    }

    public function test_deposit_can_expire(): void
    {
        $deposit = Deposit::factory()->create([
            'status' => 'active',
            'expiry_date' => now()->subDay(),
        ]);

        $deposit->expire();

        $this->assertEquals('expired', $deposit->fresh()->status);
    }

    public function test_credit_note_can_be_voided(): void
    {
        $creditNote = CreditNote::factory()->create(['status' => 'issued']);

        $creditNote->void();

        $this->assertEquals('voided', $creditNote->fresh()->status);
    }

    public function test_applied_credit_note_cannot_be_voided(): void
    {
        $creditNote = CreditNote::factory()->create(['status' => 'applied']);

        $this->expectException(\RuntimeException::class);

        $creditNote->void();
    }

    public function test_installment_can_be_waived(): void
    {
        $installment = PaymentPlanInstallment::factory()->create(['status' => 'pending']);

        $installment->waive();

        $this->assertEquals('waived', $installment->fresh()->status);
    }

    public function test_paid_installment_cannot_be_waived(): void
    {
        $installment = PaymentPlanInstallment::factory()->create(['status' => 'paid']);

        $this->expectException(\RuntimeException::class);

        $installment->waive();
    }

    public function test_split_payments_update_invoice_due_amount(): void
    {
        $invoice = Invoice::factory()->create([
            'total_amount' => 10000,
            'due_amount' => 10000,
        ]);

        $payments = $this->billingService->recordSplitPayment($invoice, [
            [
                'payment_method_id' => 1,
                'amount' => 6000,
            ],
            [
                'payment_method_id' => 2,
                'amount' => 4000,
            ],
        ]);

        $this->assertCount(2, $payments);
        $this->assertEquals(10000, $invoice->payments()->sum('amount'));
    }

    public function test_deposit_with_expiry_date_becomes_expired(): void
    {
        $deposit = Deposit::factory()->create([
            'status' => 'active',
            'expiry_date' => now()->subDay(),
        ]);

        $this->assertTrue($deposit->isExpired());
        $this->assertFalse($deposit->isCurrentlyValid());
    }

    public function test_payment_plan_next_payment_date_updates(): void
    {
        $plan = PaymentPlan::factory()->create([
            'status' => 'active',
            'total_amount' => 12000,
            'paid_amount' => 4000,
            'remaining_amount' => 8000,
            'installment_count' => 3,
            'completed_installments' => 1,
        ]);

        PaymentPlanInstallment::factory()->create([
            'payment_plan_id' => $plan->id,
            'installment_number' => 1,
            'amount' => 4000,
            'status' => 'paid',
            'due_date' => now()->subMonth(),
        ]);

        PaymentPlanInstallment::factory()->create([
            'payment_plan_id' => $plan->id,
            'installment_number' => 2,
            'amount' => 4000,
            'status' => 'pending',
            'due_date' => now()->addMonth(),
        ]);

        $payment = Payment::factory()->create(['amount' => 4000]);

        $updatedPlan = $this->billingService->processPaymentPlanInstallment($plan, 4000, $payment->id);

        $this->assertNotNull($updatedPlan->next_payment_date);
    }
}
