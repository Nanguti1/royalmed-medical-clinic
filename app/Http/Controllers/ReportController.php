<?php

namespace App\Http\Controllers;

use App\Services\ReportingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected ReportingService $service;

    public function __construct(ReportingService $service)
    {
        $this->service = $service;
        $this->middleware('can:reports.view')->only(['index', 'revenue', 'disease', 'lab', 'pharmacy', 'inventory', 'doctorPerformance', 'claims', 'shaMoh', 'billing']);
    }

    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $patientStats = $this->service->getPatientStatistics($startDate, $endDate);
        $financialReport = $this->service->getFinancialReport($startDate, $endDate);
        $labReport = $this->service->getLaboratoryReport($startDate, $endDate);
        $inventoryReport = $this->service->getInventoryReport();

        return Inertia::render('reports/index', [
            'patient_stats' => $patientStats,
            'financial_report' => $financialReport,
            'lab_report' => $labReport,
            'inventory_report' => $inventoryReport,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function revenue(Request $request): Response
    {
        $type = $request->input('type', 'daily');
        $date = $request->input('date', now()->toDateString());
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        $report = match ($type) {
            'daily' => $this->service->getDailyRevenue($date),
            'monthly' => $this->service->getMonthlyRevenue($year, $month),
            default => $this->service->getDailyRevenue($date),
        };

        $trends = $this->service->getRevenueTrends(
            now()->subMonth()->toDateString(),
            now()->toDateString()
        );

        return Inertia::render('reports/revenue', [
            'report' => $report,
            'trends' => $trends,
            'filters' => [
                'type' => $type,
                'date' => $date,
                'year' => $year,
                'month' => $month,
            ],
        ]);
    }

    public function disease(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $diseaseStats = $this->service->getDiseaseStatistics($startDate, $endDate);
        $consultationStats = $this->service->getConsultationStatistics($startDate, $endDate);

        return Inertia::render('reports/disease', [
            'disease_stats' => $diseaseStats,
            'consultation_stats' => $consultationStats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function lab(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $labReport = $this->service->getLaboratoryReport($startDate, $endDate);

        return Inertia::render('reports/lab', [
            'lab_report' => $labReport,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function pharmacy(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $drugConsumption = $this->service->getDrugConsumption($startDate, $endDate);
        $inventoryTurnover = $this->service->getInventoryTurnover($startDate, $endDate);

        return Inertia::render('reports/pharmacy', [
            'drug_consumption' => $drugConsumption,
            'inventory_turnover' => $inventoryTurnover,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function inventory(Request $request): Response
    {
        $inventoryReport = $this->service->getInventoryReport();

        return Inertia::render('reports/inventory', [
            'inventory_report' => $inventoryReport,
        ]);
    }

    public function doctorPerformance(Request $request): Response
    {
        $doctorId = $request->input('doctor_id');
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        if (! $doctorId) {
            return Inertia::render('reports/doctor-performance', [
                'performance' => null,
                'filters' => [
                    'doctor_id' => null,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]);
        }

        $performance = $this->service->getDoctorPerformance($doctorId, $startDate, $endDate);
        $productivity = $this->service->getDoctorProductivity($doctorId, $startDate, $endDate);

        return Inertia::render('reports/doctor-performance', [
            'performance' => $performance,
            'productivity' => $productivity,
            'filters' => [
                'doctor_id' => $doctorId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function claims(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $claimSuccessRate = $this->service->getClaimSuccessRate($startDate, $endDate);

        return Inertia::render('reports/claims', [
            'claim_success_rate' => $claimSuccessRate,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function shaMoh(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $patientStats = $this->service->getPatientStatistics($startDate, $endDate);
        $diseaseStats = $this->service->getDiseaseStatistics($startDate, $endDate);
        $labReport = $this->service->getLaboratoryReport($startDate, $endDate);
        $dentalReport = $this->service->getDentalReport($startDate, $endDate);

        return Inertia::render('reports/sha-moh', [
            'patient_stats' => $patientStats,
            'disease_stats' => $diseaseStats,
            'lab_report' => $labReport,
            'dental_report' => $dentalReport,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function billing(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $financialReport = $this->service->getFinancialReport($startDate, $endDate);
        $revenueTrends = $this->service->getRevenueTrends($startDate, $endDate);
        $patientGrowth = $this->service->getPatientGrowth($startDate, $endDate);
        $waitingTimeStats = $this->service->getWaitingTimeStatistics($startDate, $endDate);

        return Inertia::render('reports/billing', [
            'financial_report' => $financialReport,
            'revenue_trends' => $revenueTrends,
            'patient_growth' => $patientGrowth,
            'waiting_time_stats' => $waitingTimeStats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
