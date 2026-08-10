<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    protected PatientService $service;

    public function __construct(PatientService $service)
    {
        $this->service = $service;
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = $this->service->register($request->validated());

        return response()->json($patient, 201);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $patient = $this->service->update($patient, $request->validated());

        return response()->json($patient);
    }

    public function search()
    {
        $q = request('q');
        $results = $this->service->search($q ?? '');

        return response()->json($results);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json(null, 204);
    }
}
