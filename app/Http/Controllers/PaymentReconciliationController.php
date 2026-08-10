<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReconciliationRequest;
use App\Services\PaymentReconciliationService;
use Inertia\Inertia;
use Inertia\Response;

class PaymentReconciliationController extends Controller
{
    protected PaymentReconciliationService $reconciliationService;

    public function __construct(PaymentReconciliationService $reconciliationService)
    {
        $this->reconciliationService = $reconciliationService;

        $this->middleware('permission:reports.view')->only(['index']);
    }

    public function index(ReconciliationRequest $request): Response
    {
        $validated = $request->validated();
        $date = $validated['date'] ?? now()->toDateString();

        $reconciliationData = $this->reconciliationService->getReconciliationData($date);

        return Inertia::render('payments/reconciliation', [
            'date' => $date,
            'summary' => $reconciliationData['summary'],
            'cashPayments' => $reconciliationData['cash_payments'],
            'mpesaPayments' => $reconciliationData['mpesa_payments'],
            'staffBreakdown' => $reconciliationData['staff_breakdown'],
        ]);
    }
}
