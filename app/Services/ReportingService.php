<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\DentalTreatmentPlan;
use App\Models\InsuranceClaim;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\Visit;

class ReportingService
{
    public function getDailyRevenue(string $date): array
    {
        $revenue = Invoice::whereDate('invoice_date', $date)
            ->where('status', 'paid')
            ->sum('total_amount');

        $count = Invoice::whereDate('invoice_date', $date)
            ->where('status', 'paid')
            ->count();

        return [
            'date' => $date,
            'revenue' => $revenue,
            'invoice_count' => $count,
        ];
    }

    public function getMonthlyRevenue(string $year, string $month): array
    {
        $revenue = Invoice::whereYear('invoice_date', $year)
            ->whereMonth('invoice_date', $month)
            ->where('status', 'paid')
            ->sum('total_amount');

        $count = Invoice::whereYear('invoice_date', $year)
            ->whereMonth('invoice_date', $month)
            ->where('status', 'paid')
            ->count();

        return [
            'year' => $year,
            'month' => $month,
            'revenue' => $revenue,
            'invoice_count' => $count,
        ];
    }

    public function getPatientStatistics(string $startDate, string $endDate): array
    {
        $newPatients = Patient::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalPatients = Patient::count();
        $activePatients = Patient::whereHas('visits', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('visit_date', [$startDate, $endDate]);
        })->count();

        return [
            'new_patients' => $newPatients,
            'total_patients' => $totalPatients,
            'active_patients' => $activePatients,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getDiseaseStatistics(string $startDate, string $endDate): array
    {
        $diagnoses = Consultation::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('diagnosis, COUNT(*) as count')
            ->groupBy('diagnosis')
            ->orderByDesc('count')
            ->get();

        return [
            'diagnoses' => $diagnoses,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getConsultationStatistics(string $startDate, string $endDate): array
    {
        $totalConsultations = Consultation::whereBetween('created_at', [$startDate, $endDate])->count();
        $avgDuration = Consultation::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('end_time')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as avg_duration')
            ->first()
            ->avg_duration ?? 0;

        return [
            'total_consultations' => $totalConsultations,
            'average_duration_minutes' => round($avgDuration, 2),
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getDoctorPerformance(int $doctorId, string $startDate, string $endDate): array
    {
        $appointments = Appointment::where('doctor_id', $doctorId)
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->count();

        $completed = Appointment::where('doctor_id', $doctorId)
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        $noShows = Appointment::where('doctor_id', $doctorId)
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'no_show')
            ->count();

        $consultations = Consultation::where('doctor_id', $doctorId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $showRate = $appointments > 0 ? round((($appointments - $noShows) / $appointments) * 100, 2) : 0;

        return [
            'doctor_id' => $doctorId,
            'total_appointments' => $appointments,
            'completed_appointments' => $completed,
            'no_shows' => $noShows,
            'show_rate' => $showRate,
            'consultations' => $consultations,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getInventoryReport(): array
    {
        $items = InventoryItem::all();
        $totalValue = $items->sum(function ($item) {
            return $item->current_quantity * $item->unit_cost;
        });

        $lowStock = $items->where('current_quantity', '<=', \DB::raw('reorder_level'))->count();
        $outOfStock = $items->where('current_quantity', '<=', 0)->count();

        return [
            'total_items' => $items->count(),
            'total_value' => $totalValue,
            'low_stock_count' => $lowStock,
            'out_of_stock_count' => $outOfStock,
        ];
    }

    public function getDrugConsumption(string $startDate, string $endDate): array
    {
        $consumption = Prescription::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('drug_name, SUM(quantity) as total_quantity')
            ->groupBy('drug_name')
            ->orderByDesc('total_quantity')
            ->get();

        return [
            'drug_consumption' => $consumption,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getFinancialReport(string $startDate, string $endDate): array
    {
        $revenue = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->where('status', 'paid')
            ->sum('total_amount');

        $pending = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->where('status', 'pending')
            ->sum('total_amount');

        $overdue = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->sum('total_amount');

        return [
            'revenue' => $revenue,
            'pending' => $pending,
            'overdue' => $overdue,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getLaboratoryReport(string $startDate, string $endDate): array
    {
        $totalOrders = LabOrder::whereBetween('created_at', [$startDate, $endDate])->count();
        $completed = LabOrder::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();
        $pending = LabOrder::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'pending')
            ->count();

        return [
            'total_orders' => $totalOrders,
            'completed' => $completed,
            'pending' => $pending,
            'completion_rate' => $totalOrders > 0 ? round(($completed / $totalOrders) * 100, 2) : 0,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getDentalReport(string $startDate, string $endDate): array
    {
        $totalPlans = DentalTreatmentPlan::whereBetween('plan_date', [$startDate, $endDate])->count();
        $completed = DentalTreatmentPlan::whereBetween('plan_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        $revenue = DentalTreatmentPlan::whereBetween('plan_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('actual_cost');

        return [
            'total_treatment_plans' => $totalPlans,
            'completed_plans' => $completed,
            'revenue' => $revenue,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getRevenueTrends(string $startDate, string $endDate): array
    {
        $trends = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->where('status', 'paid')
            ->selectRaw('DATE(invoice_date) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'trends' => $trends,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getPatientGrowth(string $startDate, string $endDate): array
    {
        $growth = Patient::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'growth' => $growth,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getDoctorProductivity(int $doctorId, string $startDate, string $endDate): array
    {
        $consultations = Consultation::where('doctor_id', $doctorId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $revenue = Invoice::where('created_by', $doctorId)
            ->whereBetween('invoice_date', [$startDate, $endDate])
            ->where('status', 'paid')
            ->sum('total_amount');

        return [
            'doctor_id' => $doctorId,
            'consultations' => $consultations,
            'revenue' => $revenue,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getWaitingTimeStatistics(string $startDate, string $endDate): array
    {
        $visits = Visit::whereBetween('visit_date', [$startDate, $endDate])
            ->whereNotNull('started_at')
            ->whereNotNull('visit_date')
            ->get();

        $avgWaitTime = $visits->avg(function ($visit) {
            return $visit->started_at->diffInMinutes($visit->visit_date);
        });

        return [
            'average_wait_minutes' => round($avgWaitTime ?? 0, 2),
            'total_visits' => $visits->count(),
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getInventoryTurnover(string $startDate, string $endDate): array
    {
        $consumption = Prescription::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('drug_id, SUM(quantity) as total_consumed')
            ->groupBy('drug_id')
            ->get();

        return [
            'consumption' => $consumption,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getClaimSuccessRate(string $startDate, string $endDate): array
    {
        $claims = InsuranceClaim::whereBetween('created_at', [$startDate, $endDate])->count();
        $approved = InsuranceClaim::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'approved')
            ->count();

        $successRate = $claims > 0 ? round(($approved / $claims) * 100, 2) : 0;

        return [
            'total_claims' => $claims,
            'approved_claims' => $approved,
            'success_rate' => $successRate,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }
}
