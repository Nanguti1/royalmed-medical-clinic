<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReceiveStockRequest;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Services\InventoryService;
use App\Services\PrescriptionService;
use Inertia\Inertia;
use Inertia\Response;

class PharmacyController extends Controller
{
    protected PrescriptionService $prescriptionService;

    protected InventoryService $inventoryService;

    public function __construct(
        PrescriptionService $prescriptionService,
        InventoryService $inventoryService
    ) {
        $this->prescriptionService = $prescriptionService;
        $this->inventoryService = $inventoryService;

        $this->middleware('permission:pharmacy.view')->only(['index', 'dispense']);
        $this->middleware('permission:pharmacy.dispense')->only(['storeDispense']);
        $this->middleware('permission:inventory.view')->only(['inventory']);
        $this->middleware('permission:inventory.manage')->only(['receive', 'storeReceive']);
    }

    public function index(): Response
    {
        $prescriptions = Prescription::whereNotNull('finalized_at')
            ->whereNull('dispensed_at')
            ->with(['visit.patient', 'items.medicine'])
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return Inertia::render('pharmacy/index', [
            'prescriptions' => $prescriptions,
        ]);
    }

    public function dispense(Prescription $prescription): Response
    {
        $prescription->load(['visit.patient', 'items.medicine']);

        foreach ($prescription->items as $item) {
            $item->medicine->batches = $item->medicine->batches()
                ->where('quantity', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>', now());
                })
                ->orderBy('expiry_date', 'asc')
                ->get();
        }

        return Inertia::render('pharmacy/dispense', [
            'prescription' => $prescription,
        ]);
    }

    public function storeDispense(Prescription $prescription)
    {
        $results = $this->prescriptionService->dispense($prescription);

        // Check if visit has invoice waiting for billing
        $visit = $prescription->visit->fresh();
        if ($visit->invoice && $visit->invoice->status &&
            ($visit->invoice->status->code === 'unpaid' || $visit->invoice->status->code === 'partial')) {
            return redirect()->route('billing.show', $visit->invoice)
                ->with('success', 'Prescription dispensed successfully. Proceed to payment.');
        }

        return redirect()->route('visits.show', $prescription->visit_id)
            ->with('success', 'Prescription dispensed successfully.');
    }

    public function inventory(): Response
    {
        $medicines = Medicine::with('batches')
            ->orderBy('name')
            ->paginate(20);

        $medicines->getCollection()->transform(function ($medicine) {
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
            ];
        });

        return Inertia::render('pharmacy/inventory', [
            'medicines' => $medicines,
        ]);
    }

    public function receive(): Response
    {
        $medicines = Medicine::all();

        return Inertia::render('pharmacy/receive', [
            'medicines' => $medicines,
            'has_medicines' => $medicines->count() > 0,
        ]);
    }

    public function storeReceive(ReceiveStockRequest $request)
    {
        $batch = $this->inventoryService->receive($request->validated());

        return redirect()->route('pharmacy.inventory')
            ->with('success', 'Stock received successfully.');
    }
}
