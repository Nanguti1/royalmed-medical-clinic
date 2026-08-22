<?php

namespace App\Actions\Billing;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceStatus;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GenerateInvoiceAction
{
    public function execute(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['invoice_number'])) {
                $data['invoice_number'] = NumberGenerator::generateInvoiceNumber();
            }

            $data['created_by'] = Auth::id();
            $data['issued_at'] = $data['issued_at'] ?? now();

            // Extract items for later creation
            $items = $data['items'] ?? [];
            unset($data['items']);

            // Calculate totals from items
            $subtotal = 0;
            $totalTax = 0;

            foreach ($items as $item) {
                $itemTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                $subtotal += $itemTotal;
                $totalTax += $item['tax'] ?? 0;
            }

            $data['total_amount'] = $subtotal + $totalTax;
            $data['tax_amount'] = $totalTax;
            $data['due_amount'] = $data['total_amount'] - ($data['discount_amount'] ?? 0);

            // Set default status to 'pending' if not provided
            if (! isset($data['status_id'])) {
                $pendingStatus = InvoiceStatus::where('code', 'pending')->first();
                if ($pendingStatus) {
                    $data['status_id'] = $pendingStatus->id;
                }
            }

            // Use server update mode to set protected fields including invoice_number
            $invoice = Invoice::withServerUpdate(function () use ($data) {
                return Invoice::create($data);
            });

            // Create invoice items
            foreach ($items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax' => $item['tax'] ?? 0,
                    'total_price' => ($item['quantity'] * $item['unit_price']) + ($item['tax'] ?? 0),
                ]);
            }

            return $invoice->load('items');
        });
    }
}
