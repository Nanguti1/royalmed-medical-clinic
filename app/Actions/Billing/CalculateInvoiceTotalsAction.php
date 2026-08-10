<?php

namespace App\Actions\Billing;

use App\Models\Invoice;
use App\Services\InvoiceStatusResolver;

class CalculateInvoiceTotalsAction
{
    protected InvoiceStatusResolver $statusResolver;

    public function __construct(InvoiceStatusResolver $statusResolver)
    {
        $this->statusResolver = $statusResolver;
    }

    public function execute(Invoice $invoice, float $taxRate = 0.16): Invoice
    {
        $subtotal = 0;
        foreach ($invoice->items as $item) {
            // Server-side calculation: always recalculate from quantity * unit_price
            $calculatedTotal = round($item->quantity * $item->unit_price, 2);

            // Update item with server-calculated total (ensures consistency)
            $item->update(['total_price' => $calculatedTotal]);

            $subtotal += $calculatedTotal;
        }

        $tax = round($subtotal * $taxRate, 2);
        $grand = round($subtotal + $tax, 2);

        $invoice->update([
            'total_amount' => $grand,
        ]);

        // Use centralized resolver for due_amount and status
        $this->statusResolver->refreshStatus($invoice);

        return $invoice;
    }
}
