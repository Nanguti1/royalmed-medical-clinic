<?php

namespace App\Services;

use App\Models\Consultation;
use App\Models\InventoryBatch;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\QueueEntry;
use App\Models\Visit;
use Carbon\Carbon;

class DashboardService
{
    public function getDashboardData(?string $date = null): array
    {
        $date = $date ?? Carbon::today()->toDateString();

        return [
            'date' => $date,
            'patients' => $this->getPatientStats($date),
            'visits' => $this->getVisitStats($date),
            'queue' => $this->getQueueStats(),
            'consultations' => $this->getConsultationStats($date),
            'prescriptions' => $this->getPrescriptionStats($date),
            'pharmacy' => $this->getPharmacyStats(),
            'laboratory' => $this->getLaboratoryStats($date),
            'billing' => $this->getBillingStats($date),
            'payments' => $this->getPaymentStats($date),
            'recentPatients' => $this->getRecentPatients($date),
            'waitingQueue' => $this->getWaitingQueue(),
            'activeConsultations' => $this->getActiveConsultations(),
        ];
    }

    protected function getPatientStats(string $date): array
    {
        return [
            'total_today' => Visit::whereDate('visit_date', $date)->distinct('patient_id')->count('patient_id'),
        ];
    }

    protected function getVisitStats(string $date): array
    {
        $visits = Visit::whereDate('visit_date', $date);

        return [
            'total' => $visits->count(),
            'waiting' => (clone $visits)->whereHas('status', fn ($q) => $q->where('code', 'pending'))->count(),
            'in_consultation' => (clone $visits)->whereHas('status', fn ($q) => $q->where('code', 'in_progress'))->count(),
            'completed' => (clone $visits)->whereHas('status', fn ($q) => $q->where('code', 'completed'))->count(),
            'cancelled' => (clone $visits)->whereHas('status', fn ($q) => $q->where('code', 'cancelled'))->count(),
        ];
    }

    protected function getQueueStats(): array
    {
        return [
            'waiting' => QueueEntry::where('status', 'waiting')->count(),
            'called' => QueueEntry::where('status', 'called')->count(),
            'in_progress' => QueueEntry::where('status', 'in_progress')->count(),
        ];
    }

    protected function getConsultationStats(string $date): array
    {
        return [
            'total_today' => Consultation::whereDate('created_at', $date)->count(),
            'in_progress' => Consultation::whereHas('visit', fn ($q) => $q->whereDate('visit_date', $date)
                ->whereHas('status', fn ($q) => $q->where('code', 'in_progress')))->count(),
        ];
    }

    protected function getPrescriptionStats(string $date): array
    {
        return [
            'total_today' => Prescription::whereDate('created_at', $date)->count(),
            'pending_dispensing' => Prescription::whereDate('created_at', $date)
                ->whereNotNull('finalized_at')
                ->whereNull('dispensed_at')
                ->count(),
            'dispensed_today' => Prescription::whereDate('dispensed_at', $date)->count(),
        ];
    }

    protected function getPharmacyStats(): array
    {
        $lowStockThreshold = config('clinic.low_stock_threshold', 10);
        $expiryWarningDays = config('clinic.expiry_warning_days', 30);
        $expiryDate = Carbon::now()->addDays($expiryWarningDays)->toDateString();

        return [
            'low_stock' => InventoryBatch::where('quantity', '<=', $lowStockThreshold)
                ->where('quantity', '>', 0)
                ->count(),
            'expired' => InventoryBatch::where('expiry_date', '<', Carbon::today()->toDateString())->count(),
            'expiring_soon' => InventoryBatch::where('expiry_date', '>=', Carbon::today()->toDateString())
                ->where('expiry_date', '<=', $expiryDate)
                ->count(),
        ];
    }

    protected function getLaboratoryStats(string $date): array
    {
        return [
            'ordered_today' => LabOrder::whereDate('order_date', $date)->count(),
            'in_progress' => LabOrder::where('status', 'in_progress')->count(),
            'completed_today' => LabOrder::whereDate('completed_at', $date)->count(),
            'pending_results' => LabOrder::where('status', 'in_progress')
                ->orWhere('status', 'ordered')
                ->count(),
        ];
    }

    protected function getBillingStats(string $date): array
    {
        $invoices = Invoice::whereDate('issued_at', $date);

        return [
            'generated_today' => $invoices->count(),
            'unpaid' => Invoice::whereHas('status', fn ($q) => $q->where('code', 'unpaid'))->count(),
            'partially_paid' => Invoice::whereHas('status', fn ($q) => $q->where('code', 'partial'))->count(),
            'paid_today' => Invoice::whereDate('issued_at', $date)
                ->whereHas('status', fn ($q) => $q->where('code', 'paid'))->count(),
            'total_invoiced' => (clone $invoices)->sum('total_amount'),
            'outstanding' => Invoice::whereHas('status', fn ($q) => $q->whereIn('code', ['unpaid', 'partial']))
                ->sum('due_amount'),
        ];
    }

    protected function getPaymentStats(string $date): array
    {
        $dailyTotals = Payment::whereDate('paid_at', $date)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "cash" THEN payments.amount ELSE 0 END), 0) as cash_total,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN payments.amount ELSE 0 END), 0) as mpesa_total,
                COALESCE(SUM(payments.amount), 0) as total_amount,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "cash" THEN 1 END) as cash_count,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN 1 END) as mpesa_count
            ')
            ->leftJoin('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->first();

        return [
            'total_collected' => $dailyTotals->total_amount ?? 0,
            'cash_total' => $dailyTotals->cash_total ?? 0,
            'mpesa_total' => $dailyTotals->mpesa_total ?? 0,
            'cash_transactions' => $dailyTotals->cash_count ?? 0,
            'mpesa_transactions' => $dailyTotals->mpesa_count ?? 0,
        ];
    }

    protected function getRecentPatients(string $date): array
    {
        return Visit::whereDate('visit_date', $date)
            ->with(['patient', 'status'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($visit) => [
                'id' => $visit->id,
                'patient_name' => $visit->patient->first_name.' '.$visit->patient->last_name,
                'phone' => $visit->patient->phone,
                'visit_status' => $visit->status->code ?? 'unknown',
                'time_registered' => $visit->created_at->format('H:i'),
                'visit_id' => $visit->id,
            ])
            ->toArray();
    }

    protected function getWaitingQueue(): array
    {
        return QueueEntry::with(['visit.patient'])
            ->where('status', 'waiting')
            ->orderBy('position')
            ->limit(10)
            ->get()
            ->map(fn ($entry) => [
                'id' => $entry->id,
                'patient_name' => $entry->visit->patient->first_name.' '.$entry->visit->patient->last_name,
                'position' => $entry->position,
                'visit_id' => $entry->visit_id,
                'waiting_minutes' => $entry->created_at->diffInMinutes(now()),
            ])
            ->toArray();
    }

    protected function getActiveConsultations(): array
    {
        return Consultation::with(['visit.patient', 'visit.status'])
            ->whereHas('visit', fn ($q) => $q->whereHas('status', fn ($q) => $q->where('code', 'in_progress')))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($consultation) => [
                'id' => $consultation->id,
                'patient_name' => $consultation->visit->patient->first_name.' '.$consultation->visit->patient->last_name,
                'visit_id' => $consultation->visit_id,
                'consultation_id' => $consultation->id,
                'start_time' => $consultation->created_at->format('H:i'),
                'visit_status' => $consultation->visit->status->code ?? 'unknown',
            ])
            ->toArray();
    }
}
