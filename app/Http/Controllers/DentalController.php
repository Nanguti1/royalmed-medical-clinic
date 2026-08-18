<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DentalChairSchedule;
use App\Models\DentalProcedure;
use App\Models\DentalTreatmentPlan;
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
        $this->middleware('can:dental.create')->only(['treatmentPlansCreate', 'treatmentPlansStore', 'proceduresCreate', 'chartsCreate', 'chartsStore']);
        $this->middleware('can:dental.update')->only(['proceduresEdit']);
    }

    public function index(Request $request): Response
    {
        $today = now()->toDateString();
        $todayDayOfWeek = now()->dayName; // Monday, Tuesday, etc.

        // Get today's dental appointments for statistics
        $todayAppointments = Appointment::where('appointment_type', 'dental')
            ->whereDate('appointment_date', $today)
            ->get();

        // Get upcoming dental appointments (next 7 days) for display
        $upcomingAppointments = Appointment::with(['patient', 'doctor'])
            ->where('appointment_type', 'dental')
            ->whereDate('appointment_date', '>=', $today)
            ->whereDate('appointment_date', '<=', now()->addDays(7)->toDateString())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        // Get in-progress appointments (patients currently being treated)
        $inProgressAppointments = Appointment::with(['patient', 'doctor'])
            ->where('appointment_type', 'dental')
            ->where('status', 'in_progress')
            ->orderBy('start_time')
            ->get();

        // Get active treatment plans
        $activeTreatmentPlans = DentalTreatmentPlan::with(['patient'])
            ->whereIn('status', ['active', 'draft'])
            ->orderBy('plan_date', 'desc')
            ->limit(10)
            ->get();

        // Get chair schedules for today
        $chairSchedules = DentalChairSchedule::where('day_of_week', $todayDayOfWeek)
            ->where('is_available', true)
            ->get();

        // Get appointments with chairs for today to show occupied chairs
        $occupiedChairs = Appointment::with(['patient', 'doctor'])
            ->where('appointment_type', 'dental')
            ->whereDate('appointment_date', $today)
            ->whereNotNull('dental_chair_id')
            ->whereIn('status', ['scheduled', 'confirmed', 'in_progress'])
            ->get()
            ->map(function ($appointment) {
                $chair = DentalChairSchedule::find($appointment->dental_chair_id);

                return [
                    'id' => $appointment->dental_chair_id,
                    'chair_name' => $chair ? $chair->chair_name : "Chair {$appointment->dental_chair_id}",
                    'appointment' => [
                        'patient' => [
                            'first_name' => $appointment->patient->first_name,
                            'last_name' => $appointment->patient->last_name,
                        ],
                        'doctor' => $appointment->doctor ? [
                            'first_name' => $appointment->doctor->first_name,
                            'last_name' => $appointment->doctor->last_name,
                        ] : null,
                    ],
                ];
            });

        // Get department statistics
        $stats = [
            'today_appointments' => $todayAppointments->count(),
            'scheduled_today' => $todayAppointments->where('status', 'scheduled')->count(),
            'confirmed_today' => $todayAppointments->where('status', 'confirmed')->count(),
            'completed_today' => $todayAppointments->where('status', 'completed')->count(),
            'in_progress' => $inProgressAppointments->count(),
            'active_treatment_plans' => DentalTreatmentPlan::whereIn('status', ['active', 'draft'])->count(),
            'available_chairs' => $chairSchedules->count() - $occupiedChairs->count(),
        ];

        return Inertia::render('dental/index', [
            'stats' => $stats,
            'todayAppointments' => $todayAppointments->load(['patient', 'doctor', 'dentalChair']),
            'inProgressAppointments' => $inProgressAppointments,
            'activeTreatmentPlans' => $activeTreatmentPlans,
            'occupiedChairs' => $occupiedChairs,
            'upcomingAppointments' => $upcomingAppointments,
        ]);
    }

    public function chart(Patient $patient): Response
    {
        $chart = $this->service->getPatientDentalChart($patient->id);

        return Inertia::render('dental/chart', [
            'patient' => $patient,
            'chart' => $chart,
        ]);
    }

    public function chartsCreate(Request $request): Response
    {
        $patientId = $request->input('patient_id');
        $patient = Patient::findOrFail($patientId);

        return Inertia::render('dental/charts/create', [
            'patient' => $patient,
        ]);
    }

    public function chartsStore(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'dentist_id' => 'nullable|exists:users,id',
            'visit_id' => 'nullable|exists:visits,id',
            'chart_date' => 'required|date',
            'chief_complaint' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'dental_history' => 'nullable|string',
            'oral_hygiene' => 'nullable|array',
            'periodontal_status' => 'nullable|array',
            'findings' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $chart = $this->service->createDentalChart(array_merge($validated, [
            'created_by' => auth()->id(),
        ]));

        $patient = Patient::find($chart->patient_id);

        return redirect()->route('dental.chart', $patient)
            ->with('success', 'Dental chart created successfully.');
    }

    public function treatmentPlansIndex(Request $request): Response
    {
        $query = $request->input('search');
        $status = $request->input('status');

        $plans = DentalTreatmentPlan::with(['patient', 'treatmentItems.dentalProcedure'])
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

    public function treatmentPlansStore(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'plan_date' => 'required|date',
            'status' => 'required|in:draft,active,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'estimated_cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $treatmentPlan = $this->service->createTreatmentPlan(array_merge($validated, [
            'created_by' => auth()->id(),
        ]));

        return redirect()->route('dental.treatment-plans.show', $treatmentPlan)
            ->with('success', 'Treatment plan created successfully.');
    }

    public function treatmentPlansShow(DentalTreatmentPlan $plan): Response
    {
        $plan->load(['patient', 'treatmentItems.dentalProcedure', 'notes']);

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
