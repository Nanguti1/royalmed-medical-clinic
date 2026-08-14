<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateLabOrderRequest;
use App\Http\Requests\RecordLabResultRequest;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Visit;
use App\Services\LabService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoryController extends Controller
{
    protected LabService $labService;

    public function __construct(LabService $labService)
    {
        $this->labService = $labService;

        $this->middleware('permission:laboratory.view')->only(['index', 'show', 'patientHistory', 'testHistory', 'printOrder', 'printResult']);
        $this->middleware('permission:laboratory.order')->only(['create', 'store', 'start', 'complete', 'collectSample', 'collectSampleItem', 'receiveSampleItem', 'processSampleItem', 'completeSampleItem']);
        $this->middleware('permission:laboratory.result')->only(['recordResult', 'storeResult', 'verifyResult', 'rejectResult']);
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
        $labOrder->load([
            'visit.patient',
            'orderedBy',
            'sampleCollectedBy',
            'items.test',
            'items.result.recordedBy',
            'items.result.verifiedBy',
            'items.receivedBy',
            'items.processedBy',
            'items.completedBy',
        ]);

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
        $labOrder->load('items');
        foreach ($labOrder->items as $item) {
            if (in_array($item->sample_status, ['pending', 'ordered', null])) {
                $this->labService->collectSampleItem($item, auth()->id());
            }
        }

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Samples collected successfully.');
    }

    public function collectSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $this->labService->collectSampleItem($labOrderItem, auth()->id());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample collected successfully.');
    }

    public function receiveSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $this->labService->receiveSampleItem($labOrderItem, auth()->id());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample received successfully.');
    }

    public function processSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $this->labService->processSampleItem($labOrderItem, auth()->id());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample processing started.');
    }

    public function completeSampleItem(LabOrder $labOrder, LabOrderItem $labOrderItem)
    {
        $this->labService->completeSampleItem($labOrderItem, auth()->id());

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Sample processing completed.');
    }

    public function verifyResult(Request $request, LabOrder $labOrder, LabResult $labResult)
    {
        $user = auth()->user();
        if (! $user->can('laboratory.result') && ! $user->can('laboratory.verify') && ! $user->hasRole('Super Admin')) {
            abort(403, 'Unauthorized to verify lab results.');
        }

        $this->labService->verifyResult($labResult, $user->id);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Result verified successfully.');
    }

    public function rejectResult(Request $request, LabOrder $labOrder, LabResult $labResult)
    {
        $user = auth()->user();
        if (! $user->can('laboratory.result') && ! $user->can('laboratory.verify') && ! $user->hasRole('Super Admin')) {
            abort(403, 'Unauthorized to reject lab results.');
        }

        $reason = $request->input('rejection_reason');
        $this->labService->rejectResult($labResult, $user->id, $reason);

        return redirect()->route('laboratory.show', ['labOrder' => $labOrder])
            ->with('success', 'Result rejected successfully.');
    }

    public function patientHistory(Patient $patient): Response
    {
        $patient->load(['identifiers']);
        $history = $this->labService->getPatientHistory($patient->id);

        return Inertia::render('laboratory/patient-history', [
            'patient' => $patient,
            'history' => $history,
        ]);
    }

    public function testHistory(LabTest $labTest): Response
    {
        $labTest->load('category');
        $history = $this->labService->getTestHistory($labTest->id);

        return Inertia::render('laboratory/test-history', [
            'test' => $labTest,
            'history' => $history,
        ]);
    }

    public function printOrder(LabOrder $labOrder): Response
    {
        $labOrder->load([
            'visit.patient',
            'orderedBy',
            'sampleCollectedBy',
            'items.test',
            'items.result.recordedBy',
            'items.result.verifiedBy',
            'items.receivedBy',
            'items.processedBy',
            'items.completedBy',
        ]);

        return Inertia::render('laboratory/print', [
            'order' => $labOrder,
        ]);
    }

    public function printResult(LabResult $labResult): Response
    {
        $labResult->load([
            'test',
            'orderItem.order.visit.patient',
            'orderItem.order.orderedBy',
            'recordedBy',
            'verifiedBy',
        ]);

        return Inertia::render('laboratory/print-result', [
            'result' => $labResult,
        ]);
    }
}
