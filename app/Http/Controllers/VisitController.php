<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelVisitRequest;
use App\Http\Requests\CreateVisitRequest;
use App\Http\Requests\StartVisitRequest;
use App\Models\Visit;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;

class VisitController extends Controller
{
    protected VisitService $service;

    public function __construct(VisitService $service)
    {
        $this->service = $service;
    }

    public function store(CreateVisitRequest $request): JsonResponse
    {
        $visit = $this->service->create($request->validated());

        return response()->json($visit, 201);
    }

    public function complete(Visit $visit): JsonResponse
    {
        $visit = $this->service->complete($visit);

        return response()->json($visit);
    }

    public function start(StartVisitRequest $request, Visit $visit): JsonResponse
    {
        $visit = $this->service->start($visit);

        return response()->json($visit);
    }

    public function cancel(CancelVisitRequest $request, Visit $visit): JsonResponse
    {
        $visit = $this->service->cancel($visit);

        return response()->json($visit);
    }
}
