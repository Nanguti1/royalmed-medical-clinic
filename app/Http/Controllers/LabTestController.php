<?php

namespace App\Http\Controllers;

use App\Models\LabCategory;
use App\Models\LabTest;
use App\Models\LabTestReferenceRange;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabTestController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:laboratory.manage');
    }

    public function index(): Response
    {
        $tests = LabTest::with('category')->orderBy('name')->get();

        return Inertia::render('lab-tests/index', [
            'tests' => $tests,
        ]);
    }

    public function create(): Response
    {
        $categories = LabCategory::orderBy('name')->get();

        return Inertia::render('lab-tests/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:lab_tests',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'standard_units' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'lab_category_id' => 'nullable|exists:lab_categories,id',
            'sample_type' => 'nullable|string|max:50',
            'sample_requirements' => 'nullable|string',
            'is_critical' => 'boolean',
            'turnaround_time_hours' => 'nullable|integer|min:1',
        ]);

        LabTest::create($validated);

        return redirect()->route('lab-tests.index')
            ->with('success', 'Lab test created successfully.');
    }

    public function show(LabTest $labTest): Response
    {
        $labTest->load(['category', 'referenceRanges']);

        return Inertia::render('lab-tests/show', [
            'test' => $labTest,
        ]);
    }

    public function edit(LabTest $labTest): Response
    {
        $labTest->load(['category', 'referenceRanges']);
        $categories = LabCategory::orderBy('name')->get();

        return Inertia::render('lab-tests/edit', [
            'test' => $labTest,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, LabTest $labTest)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:lab_tests,code,'.$labTest->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'standard_units' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'lab_category_id' => 'nullable|exists:lab_categories,id',
            'sample_type' => 'nullable|string|max:50',
            'sample_requirements' => 'nullable|string',
            'is_critical' => 'boolean',
            'turnaround_time_hours' => 'nullable|integer|min:1',
        ]);

        $labTest->update($validated);

        return redirect()->route('lab-tests.index')
            ->with('success', 'Lab test updated successfully.');
    }

    public function destroy(LabTest $labTest)
    {
        $labTest->delete();

        return redirect()->route('lab-tests.index')
            ->with('success', 'Lab test deleted successfully.');
    }

    public function storeReferenceRange(Request $request, LabTest $labTest)
    {
        $validated = $request->validate([
            'age_group' => 'nullable|string|max:50',
            'sex' => 'nullable|string|max:10',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
            'min_operator' => 'nullable|string|max:5',
            'max_operator' => 'nullable|string|max:5',
            'text_range' => 'nullable|string',
        ]);

        $validated['lab_test_id'] = $labTest->id;

        LabTestReferenceRange::create($validated);

        return redirect()->route('lab-tests.edit', $labTest)
            ->with('success', 'Reference range added successfully.');
    }

    public function updateReferenceRange(Request $request, LabTest $labTest, LabTestReferenceRange $referenceRange)
    {
        $validated = $request->validate([
            'age_group' => 'nullable|string|max:50',
            'sex' => 'nullable|string|max:10',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
            'min_operator' => 'nullable|string|max:5',
            'max_operator' => 'nullable|string|max:5',
            'text_range' => 'nullable|string',
        ]);

        $referenceRange->update($validated);

        return redirect()->route('lab-tests.edit', $labTest)
            ->with('success', 'Reference range updated successfully.');
    }

    public function destroyReferenceRange(LabTest $labTest, LabTestReferenceRange $referenceRange)
    {
        $referenceRange->delete();

        return redirect()->route('lab-tests.edit', $labTest)
            ->with('success', 'Reference range deleted successfully.');
    }
}
