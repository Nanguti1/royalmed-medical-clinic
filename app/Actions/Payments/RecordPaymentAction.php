<?php

namespace App\Actions\Payments;

use App\Models\Payment;
use App\Support\Generators\NumberGenerator;

class RecordPaymentAction
{
    public function execute(array $data): Payment
    {
        if (empty($data['receipt_number'])) {
            $data['receipt_number'] = NumberGenerator::generateReceiptNumber();
        }

        return Payment::create($data);
    }
}
