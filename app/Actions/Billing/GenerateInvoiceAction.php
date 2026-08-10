<?php

namespace App\Actions\Billing;

use App\Models\Invoice;
use App\Support\Generators\NumberGenerator;

class GenerateInvoiceAction
{
    public function execute(array $data): Invoice
    {
        if (empty($data['invoice_number'])) {
            $data['invoice_number'] = NumberGenerator::generateInvoiceNumber();
        }

        return Invoice::create($data);
    }
}
