<?php

namespace App\Services;

use App\Actions\Laboratory\AddLabOrderItemAction;
use App\Actions\Laboratory\CompleteLabOrderAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Laboratory\RecordLabResultAction;
use App\Actions\Laboratory\StartLabOrderAction;
use App\Exceptions\InvalidLabOrderStatusException;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\PatientAlert;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LabService
{
    protected CreateLabOrderAction $createAction;

    protected AddLabOrderItemAction $addItemAction;

    protected RecordLabResultAction $recordAction;

    protected StartLabOrderAction $startAction;

    protected CompleteLabOrderAction $completeAction;

    public function __construct(
        CreateLabOrderAction $createAction,
        AddLabOrderItemAction $addItemAction,
        RecordLabResultAction $recordAction,
        StartLabOrderAction $startAction,
        CompleteLabOrderAction $completeAction
    ) {
        $this->createAction = $createAction;
        $this->addItemAction = $addItemAction;
        $this->recordAction = $recordAction;
        $this->startAction = $startAction;
        $this->completeAction = $completeAction;
    }

    public function createOrder(array $data): LabOrder
    {
        return DB::transaction(function () use ($data) {
            $order = $this->createAction->execute($data);
            Log::info('Lab order created', ['lab_order_id' => $order->id]);

            return $order;
        });
    }

    public function addTest(array $data)
    {
        return DB::transaction(function () use ($data) {
            return $this->addItemAction->execute($data);
        });
    }

    public function recordResult(array $data)
    {
        return DB::transaction(function () use ($data) {
            $result = $this->recordAction->execute($data);
            Log::info('Lab result recorded', ['lab_result_id' => $result->id]);

            return $result;
        });
    }

    public function start(LabOrder $order): LabOrder
    {
        return DB::transaction(function () use ($order) {
            return $this->startAction->execute($order);
        });
    }

    public function complete(LabOrder $order): LabOrder
    {
        return DB::transaction(function () use ($order) {
            return $this->completeAction->execute($order);
        });
    }

    public function collectSampleItem(LabOrderItem $item, ?int $userId = null): LabOrderItem
    {
        return DB::transaction(function () use ($item, $userId) {
            $userId = $userId ?? Auth::id();

            if (! in_array($item->sample_status, ['pending', 'ordered', null])) {
                throw InvalidLabOrderStatusException::invalidSampleTransition($item->sample_status ?? 'pending', 'collected');
            }

            if (! $item->accession_number && $item->order?->accession_number) {
                $item->accession_number = $item->order->accession_number;
            }

            if (! $item->specimen_label) {
                $item->specimen_label = NumberGenerator::generateSpecimenLabel($item->test?->sample_type ?? 'SPEC');
            }

            $item->update([
                'sample_status' => 'collected',
                'sample_collected_at' => now(),
                'sample_collected_by' => $userId,
                'accession_number' => $item->accession_number,
                'specimen_label' => $item->specimen_label,
            ]);

            if ($item->order && ! $item->order->sample_collected_at) {
                $item->order->update([
                    'sample_collected_at' => now(),
                    'sample_collected_by' => $userId,
                ]);
            }

            return $item->refresh();
        });
    }

    public function receiveSampleItem(LabOrderItem $item, ?int $userId = null): LabOrderItem
    {
        return DB::transaction(function () use ($item, $userId) {
            $userId = $userId ?? Auth::id();

            if ($item->sample_status !== 'collected') {
                throw InvalidLabOrderStatusException::invalidSampleTransition($item->sample_status ?? 'pending', 'received');
            }

            $item->update([
                'sample_status' => 'received',
                'received_at' => now(),
                'received_by' => $userId,
            ]);

            return $item->refresh();
        });
    }

    public function processSampleItem(LabOrderItem $item, ?int $userId = null): LabOrderItem
    {
        return DB::transaction(function () use ($item, $userId) {
            $userId = $userId ?? Auth::id();

            if ($item->sample_status !== 'received') {
                throw InvalidLabOrderStatusException::invalidSampleTransition($item->sample_status ?? 'pending', 'processing');
            }

            $item->update([
                'sample_status' => 'processing',
                'processing_at' => now(),
                'processed_by' => $userId,
            ]);

            if ($item->order && $item->order->isOrdered()) {
                $item->order->update([
                    'status' => 'in_progress',
                    'in_progress_at' => now(),
                ]);
            }

            return $item->refresh();
        });
    }

    public function completeSampleItem(LabOrderItem $item, ?int $userId = null): LabOrderItem
    {
        return DB::transaction(function () use ($item, $userId) {
            $userId = $userId ?? Auth::id();

            if ($item->sample_status !== 'processing') {
                throw InvalidLabOrderStatusException::invalidSampleTransition($item->sample_status ?? 'pending', 'completed');
            }

            $item->update([
                'sample_status' => 'completed',
                'completed_at' => now(),
                'completed_by' => $userId,
            ]);

            return $item->refresh();
        });
    }

    public function verifyResult(LabResult $result, ?int $userId = null): LabResult
    {
        return DB::transaction(function () use ($result, $userId) {
            $userId = $userId ?? Auth::id();

            if ($result->verification_status !== 'pending') {
                throw new \RuntimeException('Lab result is already verified or rejected.');
            }

            $result->markAsVerified($userId);

            if ($result->is_critical) {
                $this->handleCriticalResultAlert($result, $userId);
            }

            app(AuditService::class)->log(
                $userId,
                'verify_lab_result',
                $result,
                [],
                ['verification_status' => 'verified']
            );

            return $result->refresh();
        });
    }

    public function rejectResult(LabResult $result, ?int $userId = null, ?string $reason = null): LabResult
    {
        return DB::transaction(function () use ($result, $userId, $reason) {
            $userId = $userId ?? Auth::id();

            if ($result->verification_status !== 'pending') {
                throw new \RuntimeException('Lab result is already verified or rejected.');
            }

            $result->markAsRejected($userId, $reason);

            app(AuditService::class)->log(
                $userId,
                'reject_lab_result',
                $result,
                [],
                ['rejection_reason' => $reason]
            );

            return $result->refresh();
        });
    }

    public function handleCriticalResultAlert(LabResult $result, ?int $userId = null): void
    {
        $userId = $userId ?? Auth::id();
        $patient = $result->orderItem?->order?->visit?->patient;

        if ($patient) {
            $existingAlert = PatientAlert::where('patient_id', $patient->id)
                ->where('type', 'critical_lab_result')
                ->where('message', 'like', "%Result ID: {$result->id}%")
                ->first();

            if (! $existingAlert) {
                PatientAlert::create([
                    'patient_id' => $patient->id,
                    'type' => 'critical_lab_result',
                    'title' => 'Critical Lab Result: '.($result->test?->name ?? 'Lab Test'),
                    'message' => "Critical result recorded: {$result->result_value} ".($result->units ?? '').' (Ref: '.($result->reference_range ?? 'N/A')."). Result ID: {$result->id}",
                    'severity' => 'critical',
                    'is_active' => true,
                    'starts_at' => now(),
                    'created_by' => $userId,
                ]);
            }
        }

        app(AuditService::class)->log(
            $userId,
            'critical_lab_result_alert',
            $result,
            [],
            [
                'patient_id' => $patient?->id,
                'test_name' => $result->test?->name,
                'result_value' => $result->result_value,
                'is_critical' => true,
            ]
        );

        Log::warning('Critical lab result alert created', [
            'patient_id' => $patient?->id,
            'lab_result_id' => $result->id,
            'test_name' => $result->test?->name,
            'result_value' => $result->result_value,
        ]);
    }

    public function getPatientHistory(int $patientId, ?int $labTestId = null, int $perPage = 15)
    {
        $query = LabResult::with([
            'test',
            'orderItem.order.visit',
            'recordedBy',
            'verifiedBy',
        ])
            ->whereHas('orderItem.order.visit', function ($q) use ($patientId) {
                $q->where('patient_id', $patientId);
            });

        if ($labTestId) {
            $query->where('lab_test_id', $labTestId);
        }

        return $query->orderBy('recorded_at', 'desc')->paginate($perPage);
    }

    public function getTestHistory(int $labTestId, int $perPage = 15)
    {
        return LabResult::with([
            'test',
            'orderItem.order.visit.patient',
            'recordedBy',
            'verifiedBy',
        ])
            ->where('lab_test_id', $labTestId)
            ->orderBy('recorded_at', 'desc')
            ->paginate($perPage);
    }
}
