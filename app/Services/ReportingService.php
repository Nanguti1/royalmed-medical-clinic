<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\DentalTreatmentPlan;
use App\Models\InsuranceClaim;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PrescriptionItem;
use App\Models\Visit;

class ReportingService
{
    public function getDailyRevenue(string $date): array
    {
        $revenue = Invoice::whereDate('invoice_date', $date)
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
            ->sum('total_amount');

        $count = Invoice::whereDate('invoice_date', $date)
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
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
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
            ->sum('total_amount');

        $count = Invoice::whereYear('invoice_date', $year)
            ->whereMonth('invoice_date', $month)
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
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

        $returningPatients = $activePatients - $newPatients;

        // Get gender breakdown using relationship
        $byGender = [
            'male' => Patient::whereHas('gender', fn ($q) => $q->where('code', 'male'))->count(),
            'female' => Patient::whereHas('gender', fn ($q) => $q->where('code', 'female'))->count(),
            'other' => Patient::whereHas('gender', fn ($q) => $q->where('code', 'other'))->count(),
        ];

        // Get age group breakdown (database-agnostic)
        $byAgeGroup = [
            '0-18' => Patient::where('date_of_birth', '>=', now()->subYears(18)->toDateString())->count(),
            '19-35' => Patient::where('date_of_birth', '>=', now()->subYears(35)->toDateString())
                ->where('date_of_birth', '<', now()->subYears(18)->toDateString())->count(),
            '36-50' => Patient::where('date_of_birth', '>=', now()->subYears(50)->toDateString())
                ->where('date_of_birth', '<', now()->subYears(35)->toDateString())->count(),
            '51-65' => Patient::where('date_of_birth', '>=', now()->subYears(65)->toDateString())
                ->where('date_of_birth', '<', now()->subYears(50)->toDateString())->count(),
            '65+' => Patient::where('date_of_birth', '<', now()->subYears(65)->toDateString())->count(),
        ];

        return [
            'total_patients' => $totalPatients,
            'new_patients' => $newPatients,
            'returning_patients' => max(0, $returningPatients),
            'by_gender' => $byGender,
            'by_age_group' => $byAgeGroup,
            'active_patients' => $activePatients,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getDiseaseStatistics(string $startDate, string $endDate): array
    {
        $diagnoses = Diagnosis::whereHas('consultation', function ($query) use ($startDate, $endDate) {
            $query->whereHas('visit', function ($visitQuery) use ($startDate, $endDate) {
                $visitQuery->whereBetween('visit_date', [$startDate, $endDate]);
            });
        })
            ->selectRaw('description, COUNT(*) as count')
            ->groupBy('description')
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
        $totalConsultations = Consultation::whereHas('visit', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('visit_date', [$startDate, $endDate]);
        })->count();

        // Since consultations don't have start_time/end_time, we'll use visit duration
        $visits = Visit::whereBetween('visit_date', [$startDate, $endDate])
            ->whereNotNull('started_at')
            ->whereNotNull('visit_date')
            ->get();

        $avgDuration = $visits->avg(function ($visit) {
            return $visit->started_at->diffInMinutes($visit->visit_date);
        });

        return [
            'total_consultations' => $totalConsultations,
            'average_duration' => round($avgDuration ?? 0, 2),
            'by_type' => [], // TODO: Implement consultation type tracking
            'by_time_of_day' => [
                'morning' => 0, // TODO: Implement time of day tracking
                'afternoon' => 0,
                'evening' => 0,
            ],
            'average_duration_minutes' => round($avgDuration ?? 0, 2),
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
        $medicines = Medicine::with('batches', 'category')->get();
        $totalValue = 0;
        $lowStock = 0;
        $outOfStock = 0;
        $expiringSoon = 0;
        $byCategory = [];

        $expiryWarningDays = config('clinic.expiry_warning_days', 30);
        $expiryDate = now()->addDays($expiryWarningDays)->toDateString();

        foreach ($medicines as $medicine) {
            $totalQuantity = $medicine->batches->sum('quantity');
            $totalValue += $totalQuantity * $medicine->unit_price;

            if ($totalQuantity <= 0) {
                $outOfStock++;
            } elseif ($totalQuantity <= $medicine->reorder_level) {
                $lowStock++;
            }

            // Check for expiring items
            foreach ($medicine->batches as $batch) {
                if ($batch->expiry_date < now()->toDateString()) {
                    // Already expired - could track separately if needed
                } elseif ($batch->expiry_date <= $expiryDate && $batch->quantity > 0) {
                    $expiringSoon++;
                }
            }

            // Category breakdown
            $category = $medicine->category?->name ?? 'uncategorized';
            $byCategory[$category] = ($byCategory[$category] ?? 0) + $totalQuantity;
        }

        return [
            'total_items' => $medicines->count(),
            'low_stock_items' => $lowStock,
            'out_of_stock_items' => $outOfStock,
            'expiring_soon' => $expiringSoon,
            'by_category' => $byCategory,
            'total_value' => $totalValue,
            'low_stock_count' => $lowStock,
            'out_of_stock_count' => $outOfStock,
        ];
    }

    public function getDrugConsumption(string $startDate, string $endDate): array
    {
        $consumption = PrescriptionItem::whereHas('prescription', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        })
            ->with('medicine')
            ->selectRaw('medicine_id, SUM(quantity) as total_quantity')
            ->groupBy('medicine_id')
            ->orderByDesc('total_quantity')
            ->get()
            ->map(function ($item) {
                return [
                    'medicine_name' => $item->medicine->name ?? 'Unknown',
                    'total_quantity' => $item->total_quantity,
                ];
            });

        return [
            'drug_consumption' => $consumption,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getFinancialReport(string $startDate, string $endDate): array
    {
        $revenue = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
            ->sum('total_amount');

        $pending = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->whereHas('status', fn ($q) => $q->where('code', 'unpaid'))
            ->sum('total_amount');

        $overdue = Invoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->whereHas('status', fn ($q) => $q->where('code', 'unpaid'))
            ->sum('due_amount');

        // Get payment method breakdown
        $paymentMethodBreakdown = Payment::whereBetween('paid_at', [$startDate, $endDate])
            ->leftJoin('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->selectRaw('
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "cash" THEN payments.amount ELSE 0 END), 0) as cash,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) LIKE "%insurance%" THEN payments.amount ELSE 0 END), 0) as insurance,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) LIKE "%credit%" THEN payments.amount ELSE 0 END), 0) as credit
            ')
            ->first();

        return [
            'total_revenue' => $revenue,
            'total_expenses' => 0, // TODO: Implement expense tracking
            'net_profit' => $revenue, // TODO: Subtract expenses when implemented
            'by_payment_method' => [
                'cash' => $paymentMethodBreakdown->cash ?? 0,
                'insurance' => $paymentMethodBreakdown->insurance ?? 0,
                'credit' => $paymentMethodBreakdown->credit ?? 0,
            ],
            'by_service_type' => [
                'consultations' => 0, // TODO: Implement service type tracking
                'lab_tests' => 0, // TODO: Implement service type tracking
                'pharmacy' => 0, // TODO: Implement service type tracking
                'procedures' => 0, // TODO: Implement service type tracking
            ],
            'revenue' => $revenue,
            'pending' => $pending,
            'overdue' => $overdue,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getLaboratoryReport(string $startDate, string $endDate): array
    {
        $totalOrders = LabOrder::whereBetween('order_date', [$startDate, $endDate])->count();
        $completed = LabOrder::whereBetween('order_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();
        $pending = LabOrder::whereBetween('order_date', [$startDate, $endDate])
            ->where('status', 'requested')
            ->count();

        // Calculate average turnaround time
        $completedOrders = LabOrder::whereBetween('order_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->get();

        $avgTurnaround = $completedOrders->avg(function ($order) {
            return $order->order_date->diffInMinutes($order->completed_at);
        });

        // Get breakdown by test type via lab order items
        $byTestType = LabOrderItem::whereHas('order', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('order_date', [$startDate, $endDate]);
        })
            ->with('test')
            ->get()
            ->groupBy(fn ($item) => $item->test->name ?? 'Unknown')
            ->map(fn ($items) => $items->count())
            ->toArray();

        return [
            'total_tests' => $totalOrders,
            'completed_tests' => $completed,
            'pending_tests' => $pending,
            'by_test_type' => $byTestType,
            'average_turnaround_time' => round($avgTurnaround ?? 0, 2),
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
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
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
            ->whereHas('status', fn ($q) => $q->where('code', 'paid'))
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
        $consumption = PrescriptionItem::whereHas('prescription', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        })
            ->selectRaw('medicine_id, SUM(quantity) as total_consumed')
            ->groupBy('medicine_id')
            ->get()
            ->map(function ($item) {
                return [
                    'medicine_id' => $item->medicine_id,
                    'total_consumed' => $item->total_consumed,
                ];
            });

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
