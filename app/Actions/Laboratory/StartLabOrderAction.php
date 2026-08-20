<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\VisitStatus;
use Illuminate\Support\Facades\DB;

class StartLabOrderAction
{
    public function execute(LabOrder $order): LabOrder
    {
        return DB::transaction(function () use ($order) {
            // Lock the order for update to prevent concurrent starts
            $order = LabOrder::lockForUpdate()->findOrFail($order->id);

            if (! $order->canStart()) {
                if ($order->isCompleted()) {
                    throw InvalidLabOrderStatusException::invalidStatus('completed', 'in_progress');
                }

                if ($order->isInProgress()) {
                    throw InvalidLabOrderStatusException::invalidStatus('in_progress', 'in_progress');
                }

                if ($order->items->isEmpty()) {
                    throw InvalidLabOrderStatusException::invalidStatus('empty', 'in_progress');
                }

                throw InvalidLabOrderStatusException::invalidStatus($order->status, 'in_progress');
            }

            $order->update([
                'status' => 'in_progress',
                'in_progress_at' => now(),
            ]);

            // Transition visit to LAB_IN_PROGRESS when lab starts
            $labInProgressStatus = VisitStatus::where('code', 'LAB_IN_PROGRESS')->first();
            if ($labInProgressStatus && $order->visit) {
                $order->visit->update(['visit_status_id' => $labInProgressStatus->id]);
            }

            return $order;
        });
    }
}
