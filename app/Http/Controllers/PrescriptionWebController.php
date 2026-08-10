<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrescriptionWithItemsRequest;
use App\Models\DosageUnit;
use App\Models\DurationUnit;
use App\Models\Frequency;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\Route;
use App\Models\Visit;
use App\Services\PrescriptionService;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionWebController extends Controller
{
    protected PrescriptionService $prescriptionService;

    public function __construct(PrescriptionService $prescriptionService)
    {
        $this->prescriptionService = $prescriptionService;

        $this->middleware('permission:consultations.create')->only(['create', 'store']);
        $this->middleware('permission:consultations.view')->only(['show']);
    }

    public function create(Visit $visit): Response
    {
        $visit->load(['patient', 'consultation']);

        return Inertia::render('prescriptions/create', [
            'visit' => $visit,
            'medicines' => Medicine::all(),
            'dosageUnits' => DosageUnit::all(),
            'frequencies' => Frequency::all(),
            'routes' => Route::all(),
            'durationUnits' => DurationUnit::all(),
        ]);
    }

    public function store(StorePrescriptionWithItemsRequest $request)
    {
        $prescription = $this->prescriptionService->createWithItems($request->validated());

        return redirect()->route('prescriptions.show', $prescription)
            ->with('success', 'Prescription created successfully.');
    }

    public function show(Prescription $prescription): Response
    {
        $prescription->load(['visit.patient', 'items.medicine', 'items.dosageUnit', 'items.frequency', 'items.route', 'items.durationUnit']);

        return Inertia::render('prescriptions/show', [
            'prescription' => $prescription,
        ]);
    }
}
