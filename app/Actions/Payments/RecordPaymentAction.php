<?php

namespace App\Actions\Payments;

use App\Models\Payment;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\DB;

class RecordPaymentAction
{
    public function execute(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            // Generate receipt number server-side
            $data['receipt_number'] = NumberGenerator::generateReceiptNumber();

            // Only include mpesa_transaction_id if it's set
            if (! isset($data['mpesa_transaction_id'])) {
                $data['mpesa_transaction_id'] = null;
            }

            return Payment::create($data);
        });
    }
}
