<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DentalChairSchedule;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\User;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    protected AppointmentService $service;

    public function __construct(AppointmentService $service)
    {
        $this->service = $service;
        $this->middleware('can:appointments.view')->only(['index', 'show', 'calendar', 'waitlist', 'scheduleDoctor', 'scheduleDental']);
        $this->middleware('can:appointments.create')->only(['create', 'store']);
        $this->middleware('can:appointments.update')->only(['edit', 'update']);
        $this->middleware('can:appointments.delete')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $date = $request->input('date');
        $doctorId = $request->input('doctor_id');
        $status = $request->input('status');

        $query = Appointment::with(['patient', 'doctor', 'dentalChair', 'visit', 'consultation'])
            ->when($date, fn ($q) => $q->whereDate('appointment_date', $date))
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->paginate(20);

        $doctors = User::whereHas('roles', fn ($q) => $q->where('name', 'Doctor'))->get(['id', 'first_name', 'last_name']);

        return Inertia::render('appointments/index', [
            'appointments' => $query,
            'filters' => [
                'date' => $date,
                'doctor_id' => $doctorId,
                'status' => $status,
            ],
            'doctors' => $doctors,
        ]);
    }

    public function create(Request $request): Response
    {
        $patientId = $request->input('patient_id');
        $visitId = $request->input('visit_id');
        $consultationId = $request->input('consultation_id');

        $patients = Patient::select('id', 'first_name', 'last_name', 'hospital_number')->get();
        $doctors = User::whereHas('roles', fn ($q) => $q->where('name', 'Doctor'))->get(['id', 'first_name', 'last_name']);
        $dentalChairs = DentalChairSchedule::select('id', 'chair_name')->get();

        return Inertia::render('appointments/create', [
            'patients' => $patients,
            'doctors' => $doctors,
            'dentalChairs' => $dentalChairs,
            'defaults' => [
                'patient_id' => $patientId,
                'visit_id' => $visitId,
                'consultation_id' => $consultationId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'nullable|exists:users,id',
            'dental_chair_id' => 'nullable|exists:dental_chair_schedules,id',
            'visit_id' => 'nullable|exists:visits,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'appointment_type' => 'in:consultation,procedure,follow_up,walk_in',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_walk_in' => 'boolean',
            'is_follow_up' => 'boolean',
            'schedule_reminder' => 'boolean',
            'reminder_type' => 'in:sms,email',
        ]);

        $appointment = $this->service->createAppointment(array_merge($validated, [
            'created_by' => auth()->id(),
        ]));

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'Appointment created successfully.');
    }

    public function show(Appointment $appointment): Response
    {
        $appointment->load(['patient', 'doctor', 'dentalChair', 'visit', 'consultation', 'reminders']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        $appointment->load(['patient', 'doctor', 'dentalChair']);

        $patients = Patient::select('id', 'first_name', 'last_name', 'hospital_number')->get();
        $doctors = User::whereHas('roles', fn ($q) => $q->where('name', 'Doctor'))->get(['id', 'first_name', 'last_name']);
        $dentalChairs = DentalChairSchedule::select('id', 'chair_name')->get();

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment,
            'patients' => $patients,
            'doctors' => $doctors,
            'dentalChairs' => $dentalChairs,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'doctor_id' => 'nullable|exists:users,id',
            'dental_chair_id' => 'nullable|exists:dental_chair_schedules,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'appointment_type' => 'in:consultation,procedure,follow_up,walk_in',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
        ]);

        $appointment->update($validated);

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'Appointment updated successfully.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment deleted successfully.');
    }

    public function calendar(Request $request): Response
    {
        $view = $request->input('view', 'month'); // day, week, month
        $date = $request->input('date', now()->toDateString());

        $appointments = Appointment::with(['patient', 'doctor'])
            ->whereBetween('appointment_date', [
                now()->parse($date)->startOfMonth(),
                now()->parse($date)->endOfMonth(),
            ])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('appointments/calendar', [
            'appointments' => $appointments,
            'view' => $view,
            'date' => $date,
        ]);
    }

    public function waitlist(Request $request): Response
    {
        $waitlistEntries = Appointment::with(['patient', 'doctor'])
            ->where('status', 'waitlisted')
            ->orderBy('appointment_date')
            ->orderBy('created_at')
            ->paginate(20);

        return Inertia::render('appointments/waitlist', [
            'waitlistEntries' => $waitlistEntries,
        ]);
    }

    public function scheduleDoctor(Request $request): Response
    {
        $doctorId = $request->input('doctor_id');
        $date = $request->input('date', now()->toDateString());

        $schedules = DoctorSchedule::with('doctor')
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
            ->where('day_of_week', now()->parse($date)->dayOfWeek)
            ->get();

        $doctors = User::whereHas('roles', fn ($q) => $q->where('name', 'Doctor'))->get(['id', 'first_name', 'last_name']);

        return Inertia::render('appointments/schedules/doctor', [
            'schedules' => $schedules,
            'doctors' => $doctors,
            'filters' => [
                'doctor_id' => $doctorId,
                'date' => $date,
            ],
        ]);
    }

    public function scheduleDental(Request $request): Response
    {
        $chairId = $request->input('chair_id');
        $date = $request->input('date', now()->toDateString());

        $schedules = DentalChairSchedule::when($chairId, fn ($q) => $q->where('id', $chairId))->get();

        $chairs = DentalChairSchedule::select('id', 'chair_name')->get();

        return Inertia::render('appointments/schedules/dental', [
            'schedules' => $schedules,
            'chairs' => $chairs,
            'filters' => [
                'chair_id' => $chairId,
                'date' => $date,
            ],
        ]);
    }
}
