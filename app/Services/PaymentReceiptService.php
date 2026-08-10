<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Config;

class PaymentReceiptService
{
    /**
     * Get receipt data for a payment.
     *
     * @param  Payment  $payment  The payment to generate receipt for
     * @return array Receipt data
     */
    public function getReceiptData(Payment $payment): array
    {
        $payment->load([
            'invoice.visit.patient',
            'invoice.items',
            'method',
            'mpesaTransaction',
            'receivedBy',
        ]);

        $statusResolver = app(InvoiceStatusResolver::class);
        $outstandingBalance = $statusResolver->calculateOutstandingBalance($payment->invoice);
        $previouslyPaid = $payment->invoice->payments()
            ->where('id', '!=', $payment->id)
            ->sum('amount');
        $totalPaid = $payment->invoice->payments()->sum('amount');

        return [
            'clinic' => [
                'name' => Config::get('clinic.name', 'Royalmed Medical Clinic'),
                'location' => Config::get('clinic.location', 'Gatundu Town, Kiambu County'),
                'phone' => Config::get('clinic.phone', '+254 700 000 000'),
                'email' => Config::get('clinic.email', 'info@royalmed.co.ke'),
            ],
            'receipt' => [
                'number' => $payment->receipt_number,
                'date' => $payment->paid_at,
                'payment_id' => $payment->id,
            ],
            'patient' => [
                'name' => $this->getPatientName($payment->invoice->visit->patient),
                'phone' => $payment->invoice->visit->patient->phone ?? null,
            ],
            'payment' => [
                'amount' => $payment->amount,
                'method' => $payment->method?->name,
                'reference' => $payment->reference,
                'mpesa_reference' => $payment->mpesaTransaction?->transaction_id,
                'received_by' => $payment->receivedBy?->name,
            ],
            'invoice' => [
                'number' => $payment->invoice->invoice_number,
                'total' => $payment->invoice->total_amount,
                'previously_paid' => $previouslyPaid,
                'current_payment' => $payment->amount,
                'total_paid' => $totalPaid,
                'outstanding' => $outstandingBalance,
                'status' => $payment->invoice->status?->code,
                'items' => $payment->invoice->items->toArray(),
            ],
        ];
    }

    /**
     * Format patient name.
     *
     * @param  mixed  $patient
     */
    protected function getPatientName($patient): string
    {
        if (! $patient) {
            return 'Unknown Patient';
        }

        return collect([$patient->first_name, $patient->other_names, $patient->last_name])
            ->filter()
            ->implode(' ');
    }
}
