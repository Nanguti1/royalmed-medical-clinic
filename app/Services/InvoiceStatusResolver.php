<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceStatus;

class InvoiceStatusResolver
{
    /**
     * Refresh the invoice status and due amount based on current payments.
     *
     * @param  Invoice  $invoice  The invoice to refresh
     * @return Invoice The updated invoice
     */
    public function refreshStatus(Invoice $invoice): Invoice
    {
        // Cancelled invoices must never transition back to active payment statuses
        if ($invoice->isCancelled()) {
            return $invoice;
        }

        $paid = $invoice->payments()->sum('amount');
        $due = max(0, $invoice->total_amount - $paid);

        $invoice->update(['due_amount' => $due]);

        $statusCode = $this->determineStatusCode($paid, $due);
        $status = InvoiceStatus::firstOrCreate(['code' => $statusCode], ['name' => ucfirst($statusCode)]);
        $invoice->update(['status_id' => $status->id]);

        return $invoice;
    }

    /**
     * Determine the invoice status code based on payment state.
     *
     * @param  float  $paid  Total amount paid
     * @param  float  $due  Outstanding balance
     * @return string The status code ('paid', 'partial', or 'unpaid')
     */
    public function determineStatusCode(float $paid, float $due): string
    {
        if ($due <= 0) {
            return 'paid';
        }

        if ($paid > 0) {
            return 'partial';
        }

        return 'unpaid';
    }

    /**
     * Calculate the outstanding balance for an invoice.
     *
     * @param  Invoice  $invoice  The invoice to calculate balance for
     * @return float The outstanding balance
     */
    public function calculateOutstandingBalance(Invoice $invoice): float
    {
        $paid = $invoice->payments()->sum('amount');

        return max(0, $invoice->total_amount - $paid);
    }

    /**
     * Check if an invoice is fully paid.
     *
     * @param  Invoice  $invoice  The invoice to check
     * @return bool True if fully paid, false otherwise
     */
    public function isPaid(Invoice $invoice): bool
    {
        return $this->calculateOutstandingBalance($invoice) <= 0;
    }
}
