<?php

namespace App\Services;

use App\Actions\Laboratory\AddLabOrderItemAction;
use App\Actions\Laboratory\CompleteLabOrderAction;
use App\Actions\Laboratory\CreateLabOrderAction;
use App\Actions\Laboratory\RecordLabResultAction;
use App\Actions\Laboratory\StartLabOrderAction;
use App\Models\LabOrder;
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
}
