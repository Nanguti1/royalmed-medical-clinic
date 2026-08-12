<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Gender;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    protected PatientService $service;

    public function __construct(PatientService $service)
    {
        $this->service = $service;
        $this->middleware('permission:patients.view')->only(['index', 'show']);
        $this->middleware('permission:patients.create')->only(['create', 'store']);
        $this->middleware('permission:patients.update')->only(['edit', 'update']);
        $this->middleware('permission:patients.delete')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $patients = $this->service->search($query ?? '');

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'search' => $query ?? '',
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/create', [
            'genders' => Gender::all(),
        ]);
    }

    public function store(StorePatientRequest $request)
    {
        $patient = $this->service->register($request->validated());

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient registered successfully.');
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['gender', 'county', 'sub_county']);

        return Inertia::render('patients/show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient): Response
    {
        $patient->load(['gender', 'county', 'sub_county']);

        return Inertia::render('patients/edit', [
            'patient' => $patient,
            'genders' => Gender::all(),
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $patient = $this->service->update($patient, $request->validated());

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient updated successfully.');
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
