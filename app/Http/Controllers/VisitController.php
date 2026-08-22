<?php

namespace App\Http\Controllers;

use App\Exceptions\InvalidQueueStateException;
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
        $visit->load(['patient.activeAlerts', 'patient.activeAllergies', 'patient.activeChronicConditions', 'vitalSign', 'queueEntry', 'consultation', 'prescriptions.items', 'invoice', 'invoice.status', 'invoice.payments', 'labOrders', 'status', 'activityLogs.user']);

        return Inertia::render('visits/show', [
            'visit' => $visit,
            'nextAction' => $visit->getNextAction(),
            'userFacingStatus' => $visit->getUserFacingStatus(),
            'timeline' => $visit->getTimeline(),
        ]);
    }

    public function triage(Visit $visit): Response
    {
        $visit->load(['patient.activeAlerts', 'patient.activeAllergies', 'patient.activeChronicConditions', 'vitalSign']);

        // Start triage when entering triage screen
        $this->visitService->startTriage($visit);

        return Inertia::render('visits/triage', [
            'visit' => $visit,
        ]);
    }

    public function captureVitals(CaptureVitalsRequest $request, Visit $visit)
    {
        $vital = $this->vitalService->capture(array_merge($request->validated(), ['visit_id' => $visit->id]));

        // Complete triage and create consultation queue entry
        $this->visitService->completeTriage($visit);

        return redirect()->route('visits.show', $visit)
            ->with('success', 'Vitals captured successfully.');
    }

    public function queue(Request $request): Response
    {
        $department = $request->input('department');
        $entries = $this->queueService->getWorklist($department);

        return Inertia::render('visits/queue', [
            'entries' => $entries,
            'department' => $department ?? '',
        ]);
    }

    public function addToQueue(AddToQueueRequest $request, Visit $visit)
    {
        try {
            $entry = $this->queueService->add(array_merge($request->validated(), ['visit_id' => $visit->id]));

            return redirect()->route('visits.queue', ['department' => $entry->department])
                ->with('success', "Added to {$entry->department} queue successfully with queue number {$entry->queue_number}.");
        } catch (InvalidQueueStateException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function removeFromQueue(QueueEntry $entry)
    {
        try {
            $this->queueService->remove($entry);

            return redirect()->route('visits.queue')
                ->with('success', 'Removed from queue successfully.');
        } catch (InvalidQueueStateException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
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
