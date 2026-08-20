<?php

namespace App\Services;

use App\Actions\Payments\RecordMpesaPaymentAction;
use App\Actions\Payments\RecordPaymentAction;
use App\Events\PaymentRecorded;
use App\Exceptions\InvoiceAlreadyPaidException;
use App\Exceptions\InvoiceCancelledException;
use App\Exceptions\OverpaymentException;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\VisitStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected RecordPaymentAction $recordAction;

    protected InvoiceStatusResolver $statusResolver;

    public function __construct(RecordPaymentAction $recordAction, InvoiceStatusResolver $statusResolver)
    {
        $this->recordAction = $recordAction;
        $this->statusResolver = $statusResolver;
    }

    public function record(array $data, ?int $userId = null): Payment
    {
        return DB::transaction(function () use ($data, $userId) {
            $invoiceId = $data['invoice_id'] ?? null;
            $amount = (float) ($data['amount'] ?? 0);
            $invoice = null;

            // Set received_by from current user if not provided
            if ($userId && ! isset($data['received_by'])) {
                $data['received_by'] = $userId;
            }

            // Server-side validation as second layer of defense
            if ($invoiceId) {
                $invoice = Invoice::lockForUpdate()->find($invoiceId);

                if (! $invoice) {
                    throw new \InvalidArgumentException('Invoice not found.');
                }

                if ($invoice->isCancelled()) {
                    throw new InvoiceCancelledException('Cannot record payment against a cancelled invoice.');
                }

                if ($this->statusResolver->isPaid($invoice)) {
                    throw new InvoiceAlreadyPaidException('Invoice is already paid in full.');
                }

                $outstanding = $this->statusResolver->calculateOutstandingBalance($invoice);
                if ($amount > $outstanding) {
                    throw new OverpaymentException("Payment amount ({$amount}) exceeds outstanding balance ({$outstanding}).");
                }
            }

            // If mpesa data present, create transaction first
            if (! empty($data['mpesa']) && is_array($data['mpesa'])) {
                $mpesa = app(RecordMpesaPaymentAction::class)->execute($data['mpesa']);
                $data['mpesa_transaction_id'] = $mpesa->id;
            }

            $payment = $this->recordAction->execute($data);

            // update invoice balances and status using centralized resolver
            if ($invoice) {
                $this->statusResolver->refreshStatus($invoice);

                // Set visit status to PAID when invoice is fully paid
                if ($this->statusResolver->isPaid($invoice) && $invoice->visit) {
                    $paidStatus = VisitStatus::where('code', 'PAID')->first();
                    if ($paidStatus) {
                        $invoice->visit->update(['visit_status_id' => $paidStatus->id]);
                        $invoice->visit->logActivity('visit.paid', ['payment_id' => $payment->id, 'amount' => $payment->amount], $userId);
                    }
                }

                // Log payment recorded
                $invoice->visit->logActivity('visit.payment_recorded', ['payment_id' => $payment->id, 'amount' => $payment->amount], $userId);
            }

            Log::info('Payment recorded', ['payment_id' => $payment->id]);

            event(new PaymentRecorded($payment));

            return $payment;
        });
    }
}
