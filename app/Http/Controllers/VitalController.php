<?php

namespace App\Http\Controllers;

use App\Http\Requests\CaptureVitalsRequest;
use App\Services\VitalService;
use Illuminate\Http\JsonResponse;

class VitalController extends Controller
{
    protected VitalService $service;

    public function __construct(VitalService $service)
    {
        $this->service = $service;
    }

    public function store(CaptureVitalsRequest $request): JsonResponse
    {
        $vital = $this->service->capture($request->validated());

        return response()->json($vital, 201);
    }
}
