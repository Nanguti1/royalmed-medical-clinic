<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToQueueRequest;
use App\Http\Requests\CaptureVitalsRequest;
use App\Http\Requests\CreateVisitRequest;
use App\Models\Patient;
use App\Models\QueueEntry;
use App\Models\Visit;
use App\Services\QueueService;
use App\Services\VisitService;
use App\Services\VitalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    protected VisitService $visitService;

    protected VitalService $vitalService;

    protected QueueService $queueService;

    public function __construct(
        VisitService $visitService,
        VitalService $vitalService,
        QueueService $queueService
    ) {
        $this->visitService = $visitService;
        $this->vitalService = $vitalService;
        $this->queueService = $queueService;

        $this->middleware('permission:visits.view')->only(['index', 'show', 'queue']);
        $this->middleware('permission:visits.create')->only(['create', 'store']);
        $this->middleware('permission:visits.update')->only(['triage', 'captureVitals', 'start', 'complete', 'cancel']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search', '');
        $visits = Visit::with(['patient', 'vitalSign', 'queueEntry'])
            ->whereHas('patient', function ($q) use ($query) {
                if ($query) {
                    $q->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%");
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('visits/index', [
            'visits' => $visits,
            'search' => $query,
        ]);
    }

    public function create(Request $request): Response
    {
        $patientId = $request->input('patient_id');
        $patient = $patientId ? Patient::find($patientId) : null;

        return Inertia::render('visits/create', [
            'patient' => $patient,
            'patients' => Patient::orderBy('last_name')->get(),
        ]);
    }

    public function store(CreateVisitRequest $request)
    {
        $visit = $this->visitService->create($request->validated());

        return redirect()->route('visits.triage', $visit)
            ->with('success', 'Visit created successfully.');
    }

    public function show(Visit $visit): Response
    {
        $visit->load(['patient', 'vitalSign', 'queueEntry', 'consultation', 'prescriptions', 'invoice']);

        return Inertia::render('visits/show', [
            'visit' => $visit,
        ]);
    }

    public function triage(Visit $visit): Response
    {
        $visit->load(['patient', 'vitalSign']);

        return Inertia::render('visits/triage', [
            'visit' => $visit,
        ]);
    }

    public function captureVitals(CaptureVitalsRequest $request, Visit $visit)
    {
        $vital = $this->vitalService->capture(array_merge($request->validated(), ['visit_id' => $visit->id]));

        return redirect()->route('visits.show', $visit)
            ->with('success', 'Vitals captured successfully.');
    }

    public function queue(Request $request): Response
    {
        $entries = $this->queueService->waiting();
        $entries->load(['visit.patient']);

        return Inertia::render('visits/queue', [
            'entries' => $entries,
        ]);
    }

    public function addToQueue(AddToQueueRequest $request, Visit $visit)
    {
        $entry = $this->queueService->add(array_merge($request->validated(), ['visit_id' => $visit->id]));

        return redirect()->route('visits.queue')
            ->with('success', 'Added to queue successfully.');
    }

    public function removeFromQueue(QueueEntry $entry)
    {
        $this->queueService->remove($entry);

        return redirect()->route('visits.queue')
            ->with('success', 'Removed from queue successfully.');
    }

    public function start(Visit $visit)
    {
        $visit = $this->visitService->start($visit);

        return redirect()->route('visits.show', $visit)
            ->with('success', 'Visit started successfully.');
    }

    public function complete(Visit $visit)
    {
        $visit = $this->visitService->complete($visit);

        return redirect()->route('visits.show', $visit)
            ->with('success', 'Visit completed successfully.');
    }

    public function cancel(Visit $visit)
    {
        $visit = $this->visitService->cancel($visit);

        return redirect()->route('visits.index')
            ->with('success', 'Visit cancelled successfully.');
    }
}
