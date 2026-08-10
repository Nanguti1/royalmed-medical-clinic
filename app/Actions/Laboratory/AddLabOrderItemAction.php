<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\LabOrderItem;

class AddLabOrderItemAction
{
    public function execute(array $data): LabOrderItem
    {
        $order = LabOrder::find($data['lab_order_id']);

        if ($order && ! $order->canAddTest()) {
            if ($order->isCompleted()) {
                throw InvalidLabOrderStatusException::cannotAddTestToCompleted();
            }

            if ($order->isInProgress()) {
                throw InvalidLabOrderStatusException::cannotAddTestToInProgress();
            }

            throw InvalidLabOrderStatusException::invalidStatus($order->status, 'add test');
        }

        return LabOrderItem::create($data);
    }
}
