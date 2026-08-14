<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsultationRequest;
use App\Http\Requests\UpdateConsultationRequest;
use App\Models\Consultation;
use App\Models\ConsultationTemplate;
use App\Models\Visit;
use App\Services\ConsultationService;
use App\Services\QueueService;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    protected ConsultationService $consultationService;

    protected VisitService $visitService;

    protected QueueService $queueService;

    public function __construct(
        ConsultationService $consultationService,
        VisitService $visitService,
        QueueService $queueService
    ) {
        $this->consultationService = $consultationService;
        $this->visitService = $visitService;
        $this->queueService = $queueService;

        $this->middleware('permission:consultations.view')->only(['index', 'show']);
        $this->middleware('permission:consultations.create')->only(['create', 'store']);
        $this->middleware('permission:consultations.update')->only(['edit', 'update']);
    }

    public function index(): Response
    {
        $entries = $this->queueService->waiting();
        $entries->load(['visit.patient', 'visit.vitalSign']);

        return Inertia::render('consultations/index', [
            'entries' => $entries,
        ]);
    }

    public function create(Visit $visit): Response
    {
        $visit->load(['patient.activeAlerts', 'patient.activeAllergies', 'patient.activeChronicConditions', 'vitalSign', 'queueEntry']);
        $clinicalSummary = $this->consultationService->getClinicalSummary($visit->patient);
        $templates = ConsultationTemplate::where('is_active', true)->get();

        return Inertia::render('consultations/create', [
            'visit' => $visit,
            'clinical_summary' => $clinicalSummary,
            'templates' => $templates,
        ]);
    }

    public function store(StoreConsultationRequest $request)
    {
        $consultation = $this->consultationService->start($request->validated());

        return redirect()->route('consultations.show', $consultation)
            ->with('success', 'Consultation started successfully.');
    }

    public function show(Consultation $consultation): Response
    {
        $consultation->load([
            'visit.patient.activeAlerts', 'visit.patient.activeAllergies', 'visit.patient.activeChronicConditions',
            'visit.vitalSign', 'visit.queueEntry', 'visit.labOrders.items.test', 'visit.labOrders.items.result',
            'diagnoses', 'primaryDiagnoses', 'differentialDiagnoses', 'prescriptions', 'attachments',
        ]);

        $clinicalSummary = $this->consultationService->getClinicalSummary($consultation->visit->patient);

        return Inertia::render('consultations/show', [
            'consultation' => $consultation,
            'clinical_summary' => $clinicalSummary,
        ]);
    }

    public function edit(Consultation $consultation): Response
    {
        $consultation->load([
            'visit.patient.activeAlerts', 'visit.patient.activeAllergies', 'visit.patient.activeChronicConditions',
            'visit.vitalSign', 'diagnoses', 'primaryDiagnoses', 'differentialDiagnoses', 'prescriptions', 'attachments',
        ]);

        $clinicalSummary = $this->consultationService->getClinicalSummary($consultation->visit->patient);
        $templates = ConsultationTemplate::where('is_active', true)->get();

        return Inertia::render('consultations/edit', [
            'consultation' => $consultation,
            'clinical_summary' => $clinicalSummary,
            'templates' => $templates,
        ]);
    }

    public function applyTemplate(Request $request, ConsultationTemplate $template): JsonResponse
    {
        $existingData = $request->only(['chief_complaint', 'subjective', 'history', 'objective', 'examination', 'assessment', 'notes', 'plan']);
        $merged = $this->consultationService->applyTemplate($template, $existingData);

        return response()->json($merged);
    }

    public function update(UpdateConsultationRequest $request, Consultation $consultation)
    {
        $consultation = $this->consultationService->update($consultation, $request->validated());

        return redirect()->route('consultations.show', $consultation)
            ->with('success', 'Consultation updated successfully.');
    }

    public function startConsultation(Visit $visit)
    {
        $this->visitService->start($visit);

        return redirect()->route('consultations.create', $visit)
            ->with('success', 'Visit started. You can now begin the consultation.');
    }

    public function completeVisit(Visit $visit)
    {
        $this->visitService->complete($visit);

        return redirect()->route('consultations.index')
            ->with('success', 'Visit completed successfully.');
    }
}
