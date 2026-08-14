<?php

namespace App\Actions\Insurance;

use App\Models\InsuranceClaim;
use App\Models\Invoice;

class CreateInsuranceClaimAction
{
    public function execute(Invoice $invoice, array $data): InsuranceClaim
    {
        if (! $invoice->patientCoverage) {
            throw new \InvalidArgumentException('Invoice must have patient coverage to create insurance claim');
        }

        if ($invoice->insuranceClaim) {
            throw new \InvalidArgumentException('Invoice already has an insurance claim');
        }

        $claim = $invoice->createInsuranceClaim($data);

        // Create claim items from invoice items
        foreach ($invoice->items as $invoiceItem) {
            $claim->items()->create([
                'invoice_item_id' => $invoiceItem->id,
                'service_code' => $invoiceItem->description,
                'service_name' => $invoiceItem->description,
                'description' => $invoiceItem->description,
                'quantity' => $invoiceItem->quantity,
                'unit_price' => $invoiceItem->unit_price,
                'claimed_amount' => $invoiceItem->total_price,
                'approved_amount' => 0,
                'rejected_amount' => 0,
            ]);
        }

        return $claim;
    }
}
