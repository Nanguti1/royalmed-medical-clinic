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
                    if (isset($item['quantity']) && isset($item['unit_price'])) {
                        $calculatedTotal = round($item['quantity'] * $item['unit_price'], 2);
                        $item['total_price'] = $calculatedTotal;
                    }
                    $invoice->items()->create($item);
                }
            }

            // calculate totals via action
            $taxRate = config('clinic.tax_rate', 0.16);
            $this->calculateAction->execute($invoice, $taxRate);

            Log::info('Invoice created', ['invoice_id' => $invoice->id]);

            event(new InvoiceGenerated($invoice));

            return $invoice;
        });
    }
}
