<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use App\Support\Generators\NumberGenerator;

class AddLabOrderItemAction
{
    public function execute(array $data): LabOrderItem
    {
        $order = LabOrder::find($data['lab_order_id'] ?? null);

        if ($order && ! $order->canAddTest()) {
            if ($order->isCompleted()) {
                throw InvalidLabOrderStatusException::cannotAddTestToCompleted();
            }

            if ($order->isInProgress()) {
                throw InvalidLabOrderStatusException::cannotAddTestToInProgress();
            }

            throw InvalidLabOrderStatusException::invalidStatus($order->status, 'add test');
        }

        if (empty($data['accession_number']) && $order?->accession_number) {
            $data['accession_number'] = $order->accession_number;
        }

        if (empty($data['specimen_label'])) {
            $test = isset($data['lab_test_id']) ? LabTest::find($data['lab_test_id']) : null;
            $data['specimen_label'] = NumberGenerator::generateSpecimenLabel($test?->sample_type ?? 'SPEC');
        }

        return LabOrderItem::create($data);
    }
}
