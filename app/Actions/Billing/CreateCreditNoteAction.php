<?php

namespace App\Actions\Billing;

use App\Models\CreditNote;
use App\Models\Invoice;

class CreateCreditNoteAction
{
    public function execute(Invoice $invoice, array $data): CreditNote
    {
        return CreditNote::create([
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
    }
}
