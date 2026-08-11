<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use Illuminate\Support\Facades\Auth;

class RecordLabResultAction
{
    public function execute(array $data): LabResult
    {
        $orderItem = LabOrderItem::with(['order', 'result'])->findOrFail($data['lab_order_item_id']);
        $order = $orderItem->order;

        // Validate order is in progress
        if (! $order->isInProgress()) {
            if ($order->isCompleted()) {
                throw InvalidLabOrderStatusException::invalidStatus('completed', 'record result');
            }

            if ($order->isOrdered()) {
                throw InvalidLabOrderStatusException::invalidStatus('ordered', 'record result');
            }

            throw InvalidLabOrderStatusException::invalidStatus($order->status, 'record result');
        }

        // Prevent duplicate results
        if ($orderItem->result) {
            throw new \RuntimeException('A result already exists for this lab order item.');
        }

        // Validate lab test matches
        if ($orderItem->lab_test_id != $data['lab_test_id']) {
            throw new \InvalidArgumentException('Lab test does not match the order item.');
        }

        // Set recorded by if not provided
        if (! isset($data['recorded_by']) && Auth::check()) {
            $data['recorded_by'] = Auth::id();
        }

        $data['recorded_at'] = now();

        return LabResult::create($data);
    }
}
