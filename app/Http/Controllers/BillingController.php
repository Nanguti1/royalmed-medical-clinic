<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateInvoiceRequest;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;

class BillingController extends Controller
{
    protected BillingService $service;

    public function __construct(BillingService $service)
    {
        $this->service = $service;
    }

    public function store(CreateInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->service->createInvoice($request->validated());

        return response()->json($invoice, 201);
    }
}
