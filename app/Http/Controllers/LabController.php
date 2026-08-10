<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateLabOrderRequest;
use App\Services\LabService;
use Illuminate\Http\JsonResponse;

class LabController extends Controller
{
    protected LabService $service;

    public function __construct(LabService $service)
    {
        $this->service = $service;
    }

    public function store(CreateLabOrderRequest $request): JsonResponse
    {
        $order = $this->service->createOrder($request->validated());

        return response()->json($order, 201);
    }

    public function addTest(CreateLabOrderRequest $request): JsonResponse
    {
        $item = $this->service->addTest($request->validated());

        return response()->json($item, 201);
    }

    public function recordResult(CreateLabOrderRequest $request): JsonResponse
    {
        $result = $this->service->recordResult($request->validated());

        return response()->json($result, 201);
    }
}
