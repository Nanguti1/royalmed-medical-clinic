<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsultationRequest;
use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;

class ConsultationController extends Controller
{
    protected ConsultationService $service;

    public function __construct(ConsultationService $service)
    {
        $this->service = $service;
    }

    public function store(StoreConsultationRequest $request): JsonResponse
    {
        $consultation = $this->service->start($request->validated());

        return response()->json($consultation, 201);
    }
}
