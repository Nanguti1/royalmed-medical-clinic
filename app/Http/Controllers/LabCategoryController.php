<?php

namespace App\Http\Controllers;

use App\Models\LabCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:laboratory.manage');
    }

    public function index(): Response
    {
        $categories = LabCategory::orderBy('name')->get();

        return Inertia::render('lab-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('lab-categories/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:lab_categories',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        LabCategory::create($validated);

        return redirect()->route('lab-categories.index')
            ->with('success', 'Lab category created successfully.');
    }

    public function show(LabCategory $labCategory): Response
    {
        $labCategory->load('tests');

        return Inertia::render('lab-categories/show', [
            'category' => $labCategory,
        ]);
    }

    public function edit(LabCategory $labCategory): Response
    {
        return Inertia::render('lab-categories/edit', [
            'category' => $labCategory,
        ]);
    }

    public function update(Request $request, LabCategory $labCategory)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:lab_categories,code,'.$labCategory->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $labCategory->update($validated);

        return redirect()->route('lab-categories.index')
            ->with('success', 'Lab category updated successfully.');
    }

    public function destroy(LabCategory $labCategory)
    {
        $labCategory->delete();

        return redirect()->route('lab-categories.index')
            ->with('success', 'Lab category deleted successfully.');
    }
}
