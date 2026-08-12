<?php

namespace App\Actions\Billing;

use App\Models\Invoice;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\DB;

class GenerateInvoiceAction
{
    public function execute(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['invoice_number'])) {
                $data['invoice_number'] = NumberGenerator::generateInvoiceNumber();
            }

            // Use server update mode to set protected fields including invoice_number
            return Invoice::withServerUpdate(function () use ($data) {
                return Invoice::create($data);
            });
        });
    }
}
