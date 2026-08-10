<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateLabOrderRequest;
use App\Http\Requests\RecordLabResultRequest;
use App\Models\LabOrder;
use App\Models\LabTest;
use App\Models\Visit;
use App\Services\LabService;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoryWebController extends Controller
{
    protected LabService $labService;

    public function __construct(LabService $labService)
    {
        $this->labService = $labService;

        $this->middleware('permission:laboratory.view')->only(['index', 'show']);
        $this->middleware('permission:laboratory.order')->only(['create', 'store', 'start', 'complete']);
        $this->middleware('permission:laboratory.result')->only(['recordResult', 'storeResult']);
    }

    public function index(): Response
    {
        $orders = LabOrder::with(['visit.patient', 'items.test'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('laboratory/index', [
            'orders' => $orders,
        ]);
    }

    public function create(Visit $visit): Response
    {
        $visit->load(['patient', 'consultation']);
        $tests = LabTest::all();

        return Inertia::render('laboratory/create', [
            'visit' => $visit,
            'tests' => $tests,
        ]);
    }

    public function store(CreateLabOrderRequest $request)
    {
        $data = $request->validated();
        $tests = $data['tests'] ?? [];
        unset($data['tests']);

        $order = $this->labService->createOrder($data);

        foreach ($tests as $testData) {
            $this->labService->addTest([
                'lab_order_id' => $order->id,
                'lab_test_id' => $testData['lab_test_id'],
            ]);
        }

        return redirect()->route('laboratory.show', ['labOrder' => $order])
            ->with('success', 'Laboratory order created successfully.');
    }

    public function show(LabOrder $labOrder): Response
    {
        $labOrder->load(['visit.patient', 'items.test', 'items.result']);

        return Inertia::render('laboratory/show', [
            'order' => $labOrder,
        ]);
    }

    public function start(LabOrder $labOrder)
    {
        $this->labService->start($labOrder);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Laboratory order started.');
    }

    public function complete(LabOrder $labOrder)
    {
        $this->labService->complete($labOrder);

        return redirect()->route('laboratory.index')
            ->with('success', 'Laboratory order completed.');
    }

    public function recordResult(LabOrder $labOrder)
    {
        $labOrder->load(['items.test']);

        return Inertia::render('laboratory/results', [
            'order' => $labOrder,
        ]);
    }

    public function storeResult(RecordLabResultRequest $request, LabOrder $labOrder)
    {
        $result = $this->labService->recordResult($request->validated());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Result recorded successfully.');
    }
}
