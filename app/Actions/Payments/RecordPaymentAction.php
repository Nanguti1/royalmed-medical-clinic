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

            return Payment::create($data);
        });
    }
}
