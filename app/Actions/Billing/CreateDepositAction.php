<?php

namespace App\Actions\Billing;

use App\Models\Deposit;

class CreateDepositAction
{
    public function execute(array $data): Deposit
    {
        return Deposit::create([
            'deposit_number' => $data['deposit_number'] ?? null,
            'patient_id' => $data['patient_id'],
            'payment_id' => $data['payment_id'],
            'amount' => $data['amount'],
            'used_amount' => 0,
            'remaining_amount' => $data['amount'],
            'status' => 'active',
            'deposit_date' => now(),
            'expiry_date' => $data['expiry_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }
}
