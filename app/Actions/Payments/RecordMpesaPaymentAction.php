<?php

namespace App\Actions\Payments;

use App\Models\MpesaTransaction;

class RecordMpesaPaymentAction
{
    public function execute(array $data): MpesaTransaction
    {
        return MpesaTransaction::create($data);
    }
}
