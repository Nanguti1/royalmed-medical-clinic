<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    protected PaymentService $service;

    public function __construct(PaymentService $service)
    {
        $this->service = $service;
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = $this->service->record($request->validated());

        return response()->json($payment, 201);
    }
}
