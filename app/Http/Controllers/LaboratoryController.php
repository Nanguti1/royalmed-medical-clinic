<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateLabOrderRequest;
use App\Http\Requests\RecordLabResultRequest;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Visit;
use App\Services\LabService;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoryController extends Controller
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
            ->orderByRaw("FIELD(priority, 'stat', 'urgent', 'routine')")
            ->orderBy('created_at', 'desc')
            ->paginate(20);

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

    public function collectSample(LabOrder $labOrder)
    {
        $labOrder->update([
            'sample_collected_at' => now(),
            'sample_collected_by' => auth()->id(),
        ]);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample collected successfully.');
    }

    public function collectSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $labOrderItem->update([
            'sample_collected_at' => now(),
            'sample_collected_by' => auth()->id(),
            'sample_status' => 'collected',
        ]);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample collected successfully.');
    }

    public function receiveSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $labOrderItem->update([
            'sample_status' => 'received',
        ]);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample received successfully.');
    }

    public function processSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $labOrderItem->update([
            'sample_status' => 'processing',
        ]);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample processing started.');
    }

    public function completeSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $labOrderItem->update([
            'sample_status' => 'completed',
        ]);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample processing completed.');
    }

    public function verifyResult(LabOrder $labOrder, LabResult $labResult)
    {
        $labResult->markAsVerified(auth()->id());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Result verified successfully.');
    }

    public function rejectResult(LabOrder $labOrder, LabResult $labResult)
    {
        $labResult->markAsRejected(auth()->id());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Result rejected successfully.');
    }
}
