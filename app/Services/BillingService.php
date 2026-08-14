<?php

namespace App\Services;

use App\Models\CreditNote;
use App\Models\Deposit;
use App\Models\Discount;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\PaymentPlan;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;

class BillingService
{
    public function createCreditNote(Invoice $invoice, array $data): CreditNote
    {
        return DB::transaction(function () use ($invoice, $data) {
            $creditNote = CreditNote::create([
                'credit_note_number' => $data['credit_note_number'] ?? null,
                'invoice_id' => $invoice->id,
                'payment_id' => $data['payment_id'] ?? null,
                'reason' => $data['reason'],
                'amount' => $data['amount'],
                'tax_amount' => $data['tax_amount'] ?? 0,
                'total_amount' => $data['amount'] + ($data['tax_amount'] ?? 0),
                'description' => $data['description'] ?? null,
                'status' => 'issued',
                'issued_date' => now(),
                'issued_by' => $data['issued_by'] ?? auth()->id(),
                'notes' => $data['notes'] ?? null,
            ]);

            return $creditNote;
        });
    }

    public function applyCreditNote(CreditNote $creditNote, ?int $userId = null): CreditNote
    {
        if (! $creditNote->canBeApplied()) {
            throw new \RuntimeException('Credit note cannot be applied');
        }

        $creditNote->apply();

        return $creditNote;
    }

    public function createRefund(Payment $payment, array $data): Refund
    {
        if ($payment->refund_amount > 0) {
            throw new \RuntimeException('Payment already has a refund');
        }

        return DB::transaction(function () use ($payment, $data) {
            $refund = Refund::create([
                'refund_number' => $data['refund_number'] ?? null,
                'payment_id' => $payment->id,
                'credit_note_id' => $data['credit_note_id'] ?? null,
                'reason' => $data['reason'],
                'amount' => $data['amount'],
                'status' => 'pending',
                'requested_date' => now(),
                'refund_method' => $data['refund_method'] ?? 'original',
                'bank_name' => $data['bank_name'] ?? null,
                'bank_account' => $data['bank_account'] ?? null,
                'requested_by' => $data['requested_by'] ?? auth()->id(),
                'notes' => $data['notes'] ?? null,
            ]);

            $payment->refund_amount = $data['amount'];
            $payment->save();

            return $refund;
        });
    }

    public function processRefund(Refund $refund, ?int $userId = null): Refund
    {
        if (! $refund->canBeProcessed()) {
            throw new \RuntimeException('Refund cannot be processed');
        }

        $refund->process($userId);

        return $refund;
    }

    public function createDeposit(array $data): Deposit
    {
        return DB::transaction(function () use ($data) {
            $deposit = Deposit::create([
                'deposit_number' => $data['deposit_number'] ?? null,
                'patient_id' => $data['patient_id'],
                'payment_id' => $data['payment_id'],
                'amount' => $data['amount'],
                'used_amount' => 0,
                'remaining_amount' => $data['amount'],
                'status' => 'active',
                'deposit_date' => now(),
                'expiry_date' => $data['expiry_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            return $deposit;
        });
    }

    public function allocateDeposit(Deposit $deposit, Payment $payment, Invoice $invoice, float $amount): void
    {
        if (! $deposit->hasAvailableFunds($amount)) {
            throw new \RuntimeException('Insufficient deposit funds');
        }

        DB::transaction(function () use ($deposit, $payment, $invoice, $amount) {
            $deposit->useAmount($amount);

            $deposit->allocations()->create([
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'amount' => $amount,
                'allocated_at' => now(),
            ]);
        });
    }

    public function createPaymentPlan(Invoice $invoice, array $data): PaymentPlan
    {
        return $invoice->createPaymentPlan($data);
    }

    public function processPaymentPlanInstallment(PaymentPlan $plan, float $amount, ?int $paymentId = null): PaymentPlan
    {
        return DB::transaction(function () use ($plan, $amount, $paymentId) {
            $plan->makePayment($amount, $paymentId);

            // Update installment status
            $installment = $plan->installments()
                ->where('status', 'pending')
                ->orderBy('due_date')
                ->first();

            if ($installment) {
                $installment->markAsPaid($paymentId);
            }

            // Update next payment date
            if ($plan->status === 'active') {
                $nextInstallment = $plan->installments()
                    ->where('status', 'pending')
                    ->orderBy('due_date')
                    ->first();

                if ($nextInstallment) {
                    $plan->next_payment_date = $nextInstallment->due_date;
                } else {
                    $plan->next_payment_date = null;
                }
                $plan->save();
            }

            return $plan;
        });
    }

    public function applyDiscountToInvoice(Invoice $invoice, Discount $discount): Invoice
    {
        if (! $discount->isCurrentlyValid()) {
            throw new \RuntimeException('Discount is not currently valid');
        }

        $discountAmount = $discount->calculateDiscount($invoice->total_amount);

        return DB::transaction(function () use ($invoice, $discount, $discountAmount) {
            $invoice->discount_id = $discount->id;
            $invoice->discount_amount = $discountAmount;
            $invoice->due_amount = $invoice->total_amount - $discountAmount;
            $invoice->save();

            return $invoice;
        });
    }

    public function recordCardPayment(array $data, ?int $userId = null): Payment
    {
        return DB::transaction(function () use ($data, $userId) {
            $data['payment_method_id'] = $this->getCardPaymentMethodId();
            $data['card_last_four'] = substr($data['card_number'] ?? '', -4);
            $data['card_type'] = $data['card_type'] ?? 'visa';
            $data['transaction_id'] = $data['transaction_id'] ?? null;
            $data['received_by'] = $userId ?? auth()->id();

            return Payment::create($data);
        });
    }

    public function recordSplitPayment(Invoice $invoice, array $payments): array
    {
        return DB::transaction(function () use ($invoice, $payments) {
            $createdPayments = [];

            foreach ($payments as $paymentData) {
                $paymentData['invoice_id'] = $invoice->id;
                $paymentData['received_by'] = $paymentData['received_by'] ?? auth()->id();
                $createdPayments[] = Payment::create($paymentData);
            }

            return $createdPayments;
        });
    }

    protected function getCardPaymentMethodId(): int
    {
        $method = PaymentMethod::where('type', 'card')->first();
        if (! $method) {
            $method = PaymentMethod::create([
                'name' => 'Card Payment',
                'type' => 'card',
                'provider' => 'Generic',
                'is_active' => true,
            ]);
        }

        return $method->id;
    }

    public function getOutstandingBalanceReport(): array
    {
        return [
            'total_outstanding' => Invoice::whereDoesntHave('insuranceClaim')->sum('due_amount'),
            'insurance_outstanding' => Invoice::where('is_insurance_claim', true)->sum('due_amount'),
            'payment_plans_active' => PaymentPlan::active()->count(),
            'payment_plans_overdue' => PaymentPlan::overdue()->count(),
            'deposits_active' => Deposit::active()->sum('remaining_amount'),
        ];
    }
}
