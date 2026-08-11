<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompleteLabOrderAction
{
    public function execute(LabOrder $order): LabOrder
    {
        return DB::transaction(function () use ($order) {
            // Lock the order for update to prevent concurrent completions
            $order = LabOrder::lockForUpdate()->findOrFail($order->id);

            if (! $order->canComplete()) {
                if ($order->isCompleted()) {
                    throw InvalidLabOrderStatusException::invalidStatus('completed', 'completed');
                }

                if ($order->isOrdered()) {
                    throw InvalidLabOrderStatusException::invalidStatus('ordered', 'completed');
                }

                throw InvalidLabOrderStatusException::invalidStatus($order->status, 'completed');
            }

            // Validate all items have results
            $order->load('items.result');
            $itemsWithoutResults = $order->items->filter(fn ($item) => ! $item->result);

            if ($itemsWithoutResults->isNotEmpty()) {
                throw new \RuntimeException('Cannot complete order: Some items do not have results.');
            }

            $order->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            Log::info('Lab order completed', ['lab_order_id' => $order->id]);

            return $order;
        });
    }
}
