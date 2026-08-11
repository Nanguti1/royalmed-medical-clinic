<?php

namespace App\Services;

use App\Actions\Billing\CalculateInvoiceTotalsAction;
use App\Actions\Billing\GenerateInvoiceAction;
use App\Events\InvoiceGenerated;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    protected GenerateInvoiceAction $generateAction;

    protected CalculateInvoiceTotalsAction $calculateAction;

    protected InvoiceStatusResolver $statusResolver;

    public function __construct(GenerateInvoiceAction $generateAction, CalculateInvoiceTotalsAction $calculateAction, InvoiceStatusResolver $statusResolver)
    {
        $this->generateAction = $generateAction;
        $this->calculateAction = $calculateAction;
        $this->statusResolver = $statusResolver;
    }

    public function createInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $invoice = $this->generateAction->execute($data);

            if (! empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    // Server-side calculation: ignore client-supplied total_price
                    // Don't set total_price here - let CalculateInvoiceTotalsAction handle it
                    unset($item['total_price']);
                    $invoice->items()->create($item);
                }

                // Reload items from database to ensure they're visible in the transaction
                $invoice->refresh();
                $invoice->load('items');
            }

            // calculate totals via action
            $taxRate = config('clinic.tax_rate', 0.16);
            $this->calculateAction->execute($invoice, $taxRate);

            // Refresh to get the updated totals and status
            $invoice->refresh();

            Log::info('Invoice created', ['invoice_id' => $invoice->id]);

            event(new InvoiceGenerated($invoice));

            return $invoice;
        });
    }
}
