<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\VaccinationCertificate;
use App\Models\VaccinationRecord;
use App\Models\VaccinationReminder;
use App\Models\Vaccine;
use App\Services\VaccinationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VaccinationController extends Controller
{
    protected VaccinationService $service;

    public function __construct(VaccinationService $service)
    {
        $this->service = $service;
        $this->middleware('can:vaccinations.view')->only(['index', 'show', 'schedule', 'certificatesIndex', 'certificatesPrint', 'patientVaccinations', 'reminders']);
        $this->middleware('can:vaccinations.create')->only(['create', 'store', 'certificatesGenerate']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $status = $request->input('status');

        $records = VaccinationRecord::when($query, fn ($q) => $q->where('record_number', 'like', "%{$query}%")
            ->orWhereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->with(['patient', 'vaccine', 'administeredBy'])
            ->orderBy('administration_date', 'desc')
            ->paginate(20);

        return Inertia::render('vaccinations/index', [
            'records' => $records,
            'filters' => [
                'search' => $query,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'hospital_number')->get();
        $vaccines = Vaccine::active()->get();

        return Inertia::render('vaccinations/create', [
            'patients' => $patients,
            'vaccines' => $vaccines,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'vaccine_id' => 'required|exists:vaccines,id',
            'visit_id' => 'nullable|exists:visits,id',
            'administration_date' => 'required|date',
            'dose_number' => 'required|integer|min:1',
            'batch_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'site' => 'in:left_arm,right_arm,thigh',
            'route' => 'in:intramuscular,subcutaneous,oral,nasal',
            'dosage' => 'nullable|numeric',
            'dosage_unit' => 'nullable|string',
            'reactions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $record = $this->service->recordVaccination(array_merge($validated, [
            'administered_by' => auth()->id(),
        ]));

        return redirect()->route('vaccinations.show', $record)
            ->with('success', 'Vaccination recorded successfully.');
    }

    public function show(VaccinationRecord $record): Response
    {
        $record->load(['patient', 'vaccine', 'administeredBy', 'reminders', 'certificates']);

        return Inertia::render('vaccinations/show', [
            'record' => $record,
        ]);
    }

    public function schedule(Request $request): Response
    {
        $ageMonths = $request->input('age_months', 0);
        $schedule = $this->service->getVaccinationSchedule($ageMonths);

        return Inertia::render('vaccinations/schedule', [
            'schedule' => $schedule,
            'age_months' => $ageMonths,
        ]);
    }

    public function certificatesIndex(Request $request): Response
    {
        $query = $request->input('search');

        $certificates = VaccinationCertificate::when($query, fn ($q) => $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")))
            ->with(['patient', 'vaccinationRecord.vaccine', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('vaccinations/certificates/index', [
            'certificates' => $certificates,
            'filters' => [
                'search' => $query,
            ],
        ]);
    }

    public function certificatesGenerate(VaccinationRecord $record, Request $request)
    {
        $validated = $request->validate([
            'valid_from' => 'required|date',
            'valid_until' => 'nullable|date',
            'issuing_authority' => 'required|string',
            'issuer_name' => 'required|string',
            'issuer_license' => 'nullable|string',
        ]);

        $certificate = $this->service->issueCertificate($record, array_merge($validated, [
            'created_by' => auth()->id(),
        ]));

        return redirect()->route('vaccinations.certificates.index')
            ->with('success', 'Certificate generated successfully.');
    }

    public function certificatesPrint(VaccinationCertificate $certificate): Response
    {
        $certificate->load(['patient', 'vaccinationRecord.vaccine', 'createdBy']);

        return Inertia::render('vaccinations/certificates/print', [
            'certificate' => $certificate,
        ]);
    }

    public function patientVaccinations(Patient $patient): Response
    {
        $history = $this->service->getPatientVaccinationHistory($patient->id);
        $due = $this->service->getDueVaccinations($patient->id);
        $overdue = $this->service->getOverdueVaccinations($patient->id);

        return Inertia::render('vaccinations/patients/index', [
            'patient' => $patient,
            'history' => $history,
            'due' => $due,
            'overdue' => $overdue,
        ]);
    }

    public function reminders(Request $request): Response
    {
        $status = $request->input('status', 'pending');

        $reminders = match ($status) {
            'pending' => VaccinationReminder::pending(),
            'sent' => VaccinationReminder::sent(),
            'failed' => VaccinationReminder::failed(),
            default => VaccinationReminder::query(),
        };

        $reminders = $reminders->with(['patient', 'vaccinationRecord.vaccine'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate(20);

        return Inertia::render('vaccinations/reminders', [
            'reminders' => $reminders,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }
}
