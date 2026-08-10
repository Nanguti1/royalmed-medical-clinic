<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReceiveStockRequest;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    protected InventoryService $service;

    public function __construct(InventoryService $service)
    {
        $this->service = $service;
    }

    public function receive(ReceiveStockRequest $request): JsonResponse
    {
        $batch = $this->service->receive($request->validated());

        return response()->json($batch, 201);
    }
}
