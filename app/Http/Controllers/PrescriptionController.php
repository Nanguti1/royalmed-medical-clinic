<?php

namespace App\Http\Controllers;

use App\Http\Requests\DispensePrescriptionRequest;
use App\Http\Requests\FinalizePrescriptionRequest;
use App\Http\Requests\StorePrescriptionItemRequest;
use App\Http\Requests\StorePrescriptionRequest;
use App\Models\Prescription;
use App\Services\PrescriptionService;
use Illuminate\Http\JsonResponse;

class PrescriptionController extends Controller
{
    protected PrescriptionService $service;

    public function __construct(PrescriptionService $service)
    {
        $this->service = $service;
    }

    public function store(StorePrescriptionRequest $request): JsonResponse
    {
        $prescription = $this->service->create($request->validated());

        return response()->json($prescription, 201);
    }

    public function addItem(StorePrescriptionItemRequest $request): JsonResponse
    {
        $item = $this->service->addItem($request->validated());

        return response()->json($item, 201);
    }

    public function finalize(FinalizePrescriptionRequest $request, Prescription $prescription): JsonResponse
    {
        $prescription = $this->service->finalize($prescription);

        return response()->json($prescription);
    }

    public function dispense(DispensePrescriptionRequest $request, Prescription $prescription): JsonResponse
    {
        $results = $this->service->dispense($prescription);

        return response()->json($results);
    }
}
