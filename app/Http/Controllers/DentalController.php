<?php

namespace App\Http\Controllers;

use App\Models\DentalTreatmentPlan;
use App\Models\DentalProcedure;
use App\Models\Patient;
use App\Services\DentalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DentalController extends Controller
{
    protected DentalService $service;

    public function __construct(DentalService $service)
    {
        $this->service = $service;
        $this->middleware('can:dental.view')->only(['index', 'chart', 'treatmentPlansIndex', 'treatmentPlansShow', 'proceduresIndex', 'attachments', 'notes']);
        $this->middleware('can:dental.create')->only(['treatmentPlansCreate', 'proceduresCreate']);
        $this->middleware('can:dental.update')->only(['proceduresEdit']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $date = $request->input('date');

        $appointments = $this->service->getDentalAppointments($date, $query);

        return Inertia::render('dental/index', [
            'appointments' => $appointments,
            'filters' => [
                'search' => $query,
                'date' => $date,
            ],
        ]);
    }

    public function chart(Patient $patient): Response
    {
        $chart = $this->service->getPatientDentalChart($patient->id);

        return Inertia::render('dental/chart', [
            'patient' => $patient->load(['dentalChart', 'dentalTeeth', 'dentalPeriodontalMeasurements']),
            'chart' => $chart,
        ]);
    }

    public function treatmentPlansIndex(Request $request): Response
    {
        $query = $request->input('search');
        $status = $request->input('status');

        $plans = DentalTreatmentPlan::with(['patient', 'procedures'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($query, fn ($q) => $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('hospital_number', 'like', "%{$query}%")))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('dental/treatment-plans/index', [
            'plans' => $plans,
            'filters' => [
                'search' => $query,
                'status' => $status,
            ],
        ]);
    }

    public function treatmentPlansCreate(Request $request): Response
    {
        $patientId = $request->input('patient_id');
        $patients = Patient::select('id', 'first_name', 'last_name', 'hospital_number')->get();

        return Inertia::render('dental/treatment-plans/create', [
            'patients' => $patients,
            'defaults' => [
                'patient_id' => $patientId,
            ],
        ]);
    }

    public function treatmentPlansShow(DentalTreatmentPlan $plan): Response
    {
        $plan->load(['patient', 'procedures', 'attachments', 'notes']);

        return Inertia::render('dental/treatment-plans/show', [
            'plan' => $plan,
        ]);
    }

    public function proceduresIndex(Request $request): Response
    {
        $query = $request->input('search');
        $category = $request->input('category');

        $procedures = DentalProcedure::when($query, fn ($q) => $q->where('name', 'like', "%{$query}%")
            ->orWhere('code', 'like', "%{$query}%"))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('dental/procedures/index', [
            'procedures' => $procedures,
            'filters' => [
                'search' => $query,
                'category' => $category,
            ],
        ]);
    }

    public function proceduresCreate(): Response
    {
        return Inertia::render('dental/procedures/create');
    }

    public function proceduresEdit(DentalProcedure $procedure): Response
    {
        return Inertia::render('dental/procedures/edit', [
            'procedure' => $procedure,
        ]);
    }

    public function attachments(Patient $patient): Response
    {
        $attachments = $this->service->getPatientDentalAttachments($patient->id);

        return Inertia::render('dental/attachments', [
            'patient' => $patient,
            'attachments' => $attachments,
        ]);
    }

    public function notes(Patient $patient): Response
    {
        $notes = $this->service->getPatientDentalNotes($patient->id);

        return Inertia::render('dental/notes', [
            'patient' => $patient,
            'notes' => $notes,
        ]);
    }
}
