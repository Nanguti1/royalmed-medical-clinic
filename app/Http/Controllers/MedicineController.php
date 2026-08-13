<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineCategory;
use App\Models\MedicineForm;
use App\Models\MedicineStrength;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicineController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:inventory.manage');
    }

    public function index(): Response
    {
        $medicines = Medicine::with(['category', 'form', 'strength', 'batches'])
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

        return Inertia::render('medicines/index', [
            'medicines' => $medicines,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('medicines/create', [
            'categories' => MedicineCategory::all(),
            'forms' => MedicineForm::all(),
            'strengths' => MedicineStrength::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'medicine_category_id' => 'nullable|exists:medicine_categories,id',
            'medicine_form_id' => 'nullable|exists:medicine_forms,id',
            'medicine_strength_id' => 'nullable|exists:medicine_strengths,id',
            'unit_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
        ]);

        Medicine::create($validated);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine created successfully.');
    }

    public function show(Medicine $medicine): Response
    {
        $medicine->load(['category', 'form', 'strength', 'batches']);

        return Inertia::render('medicines/show', [
            'medicine' => $medicine,
        ]);
    }

    public function edit(Medicine $medicine): Response
    {
        return Inertia::render('medicines/edit', [
            'medicine' => $medicine,
            'categories' => MedicineCategory::all(),
            'forms' => MedicineForm::all(),
            'strengths' => MedicineStrength::all(),
        ]);
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'medicine_category_id' => 'nullable|exists:medicine_categories,id',
            'medicine_form_id' => 'nullable|exists:medicine_forms,id',
            'medicine_strength_id' => 'nullable|exists:medicine_strengths,id',
            'unit_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
        ]);

        $medicine->update($validated);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine updated successfully.');
    }

    public function destroy(Medicine $medicine)
    {
        $medicine->delete();

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine deleted successfully.');
    }
}
