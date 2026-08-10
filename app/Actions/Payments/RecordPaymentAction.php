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
            // Generate receipt number if not already provided
            if (empty($data['receipt_number'])) {
                $data['receipt_number'] = NumberGenerator::generateReceiptNumber();
            }

            return Payment::create($data);
        });
    }
}
