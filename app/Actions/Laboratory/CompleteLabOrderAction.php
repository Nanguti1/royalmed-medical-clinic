<?php

namespace App\Actions\Laboratory;

use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\QueueEntry;
use App\Models\VisitStatus;
use App\Services\QueueService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompleteLabOrderAction
{
    protected QueueService $queueService;

    public function __construct(QueueService $queueService)
    {
        $this->queueService = $queueService;
    }

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

            // Transition visit to LAB_RESULTS_READY
            $labResultsReadyStatus = VisitStatus::where('code', 'LAB_RESULTS_READY')->first();
            if ($labResultsReadyStatus && $order->visit) {
                $order->visit->update(['visit_status_id' => $labResultsReadyStatus->id]);
            }

            // Create consultation queue item for originating doctor on lab completion
            if ($order->consultation && $order->orderedBy) {
                $visit = $order->visit;
                $consultation = $order->consultation;
                $doctor = $order->orderedBy;

                // Check if there's already an active consultation queue entry for this visit
                $existingQueueEntry = QueueEntry::where('visit_id', $visit->id)
                    ->where('department', 'consultation')
                    ->whereIn('status', ['waiting', 'called', 'in_progress'])
                    ->first();

                if (! $existingQueueEntry) {
                    // Create queue entry with metadata for Continue Consultation action
                    $this->queueService->add([
                        'visit_id' => $visit->id,
                        'department' => 'consultation',
                        'priority' => 'normal',
                        'metadata' => [
                            'action' => 'continue_consultation',
                            'consultation_id' => $consultation->id,
                            'lab_order_id' => $order->id,
                        ],
                    ]);
                }
            }

            Log::info('Lab order completed', ['lab_order_id' => $order->id]);

            return $order;
        });
    }
}
