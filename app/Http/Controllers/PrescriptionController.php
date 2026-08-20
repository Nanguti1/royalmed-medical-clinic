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

class PrescriptionController extends Controller
{
    protected PrescriptionService $prescriptionService;

    public function __construct(PrescriptionService $prescriptionService)
    {
        $this->prescriptionService = $prescriptionService;

        $this->middleware('permission:consultations.create')->only(['create', 'store']);
        $this->middleware('permission:consultations.view')->only(['index', 'show']);
    }

    public function index(): Response
    {
        $prescriptions = Prescription::with(['visit.patient'])->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('prescriptions/index', [
            'prescriptions' => $prescriptions,
        ]);
    }

    public function create(Visit $visit): Response
    {
        $visit->load(['patient', 'consultation']);

        $medicines = Medicine::with(['batches'])->get();
        $medicines = $medicines->map(function ($medicine) {
            $totalStock = $medicine->batches->sum('quantity');
            $isLowStock = $totalStock < ($medicine->reorder_level ?? 0);
            $hasExpired = $medicine->batches->contains(fn ($batch) => $batch->isExpired());
            $expiringSoon = $medicine->batches->contains(fn ($batch) => ! $batch->isExpired() && $batch->expiry_date && $batch->expiry_date->diffInDays(now()) <= 30);

            return [
                ...$medicine->toArray(),
                'total_stock' => $totalStock,
                'is_low_stock' => $isLowStock,
                'has_expired' => $hasExpired,
                'expiring_soon' => $expiringSoon,
                'is_available' => $totalStock > 0 && ! $hasExpired,
            ];
        });

        return Inertia::render('prescriptions/create', [
            'visit' => $visit,
            'medicines' => $medicines,
            'dosageUnits' => DosageUnit::all(),
            'frequencies' => Frequency::all(),
            'routes' => Route::all(),
            'durationUnits' => DurationUnit::all(),
        ]);
    }

    public function store(StorePrescriptionWithItemsRequest $request)
    {
        $prescription = $this->prescriptionService->createWithItems($request->validated());

        $prescription->load('visit.consultation');

        if ($prescription->visit->consultation) {
            return redirect()->route('consultations.show', $prescription->visit->consultation)
                ->with('success', 'Prescription created successfully.');
        }

        return redirect()->route('visits.show', $prescription->visit_id)
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
