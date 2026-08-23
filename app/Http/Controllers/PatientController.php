<?php

namespace App\Http\Controllers;

use App\Http\Requests\MergePatientsRequest;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\County;
use App\Models\Gender;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    protected PatientService $service;

    public function __construct(PatientService $service)
    {
        $this->service = $service;
        $this->middleware('permission:patients.view')->only(['index', 'show', 'checkDuplicates']);
        $this->middleware('permission:patients.create')->only(['create', 'store']);
        $this->middleware('permission:patients.update')->only(['edit', 'update', 'merge']);
        $this->middleware('permission:patients.delete')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $patients = Patient::with(['gender', 'county', 'sub_county', 'identifiers', 'activeAlerts', 'activeAllergies'])
            ->where(function ($q) use ($query) {
                if ($query) {
                    $q->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%")
                        ->orWhere('hospital_number', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhereHas('identifiers', fn ($i) => $i->where('identifier_value', 'like', "%{$query}%"));
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'search' => $query ?? '',
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/create', [
            'genders' => Gender::all(),
            'counties' => County::with('sub_counties')->get(),
        ]);
    }

    public function store(StorePatientRequest $request)
    {
        try {
            $validated = $request->validated();

            if (! $request->boolean('confirm_duplicate')) {
                try {
                    $duplicates = $this->service->findDuplicates($validated);
                    if ($duplicates->isNotEmpty()) {
                        return redirect()->back()
                            ->withInput()
                            ->with([
                                'warning' => 'Potential duplicate patient(s) detected. Please confirm to proceed.',
                                'duplicate_candidates' => $duplicates,
                            ]);
                    }
                } catch (\Exception $e) {
                    // If duplicate check fails, log but continue with registration
                    \Log::warning('Duplicate check failed, proceeding with registration', [
                        'error' => $e->getMessage(),
                        'data' => $validated,
                    ]);
                }
            }

            $patient = $this->service->register($validated);

            return redirect()->route('patients.show', $patient)
                ->with('success', 'Patient registered successfully.');
        } catch (\Exception $e) {
            \Log::error('Patient registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to register patient: '.$e->getMessage());
        }
    }

    public function checkDuplicates(Request $request): JsonResponse
    {
        $duplicates = $this->service->findDuplicates($request->all(), $request->input('ignore_patient_id'));

        return response()->json([
            'has_duplicates' => $duplicates->isNotEmpty(),
            'candidates' => $duplicates,
        ]);
    }

    public function show(Patient $patient): Response
    {
        $patient->load([
            'gender', 'county', 'sub_county',
            'identifiers', 'contacts', 'addresses', 'emergencyContacts',
            'relationships.relatedPatient', 'allergies.recordedBy',
            'chronicConditions.recordedBy', 'alerts.createdBy',
            'activeAlerts', 'activeAllergies', 'activeChronicConditions',
            'visits.vitalSign',
        ]);

        return Inertia::render('patients/show', [
            'patient' => $patient,
            'timelineEvents' => [], // Will be populated by timeline service
        ]);
    }

    public function edit(Patient $patient): Response
    {
        $patient->load([
            'gender', 'county', 'sub_county',
            'identifiers', 'contacts', 'addresses', 'emergencyContacts',
            'relationships.relatedPatient', 'allergies', 'chronicConditions', 'alerts',
        ]);

        return Inertia::render('patients/edit', [
            'patient' => $patient,
            'genders' => Gender::all(),
            'counties' => County::with('sub_counties')->get(),
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $patient = $this->service->update($patient, $request->validated());

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient updated successfully.');
    }

    public function merge(MergePatientsRequest $request, Patient $patient)
    {
        $targetPatient = Patient::findOrFail($request->input('target_patient_id'));
        $reason = $request->input('reason');

        $mergeRecord = $this->service->merge($patient, $targetPatient, $request->user(), $reason);

        return redirect()->route('patients.show', $targetPatient)
            ->with('success', "Patient {$patient->hospital_number} successfully merged into {$targetPatient->hospital_number}.");
    }

    public function destroy(Patient $patient)
    {
        try {
            $this->service->delete($patient);

            return redirect()->route('patients.index')
                ->with('success', 'Patient deleted successfully.');
        } catch (\RuntimeException $e) {
            return redirect()->route('patients.index')
                ->with('error', $e->getMessage());
        }
    }
}
