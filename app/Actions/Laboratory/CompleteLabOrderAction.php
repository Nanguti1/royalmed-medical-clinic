<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use Illuminate\Support\Facades\Log;

class CompleteLabOrderAction
{
    public function execute(LabOrder $order): LabOrder
    {
        if (! $order->canComplete()) {
            if ($order->isCompleted()) {
                throw InvalidLabOrderStatusException::invalidStatus('completed', 'completed');
            }

            if ($order->isOrdered()) {
                throw InvalidLabOrderStatusException::invalidStatus('ordered', 'completed');
            }

            throw InvalidLabOrderStatusException::invalidStatus($order->status, 'completed');
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        Log::info('Lab order completed', ['lab_order_id' => $order->id]);

        return $order;
    }
}
