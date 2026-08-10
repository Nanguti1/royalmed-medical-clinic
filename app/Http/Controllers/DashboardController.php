<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request): Response
    {
        $date = $request->input('date', now()->toDateString());

        $data = $this->dashboardService->getDashboardData($date);

        return Inertia::render('dashboard', $data);
    }
}
