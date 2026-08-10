<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Collection;

class PaymentReconciliationService
{
    /**
     * Get daily payment summary for a specific date.
     *
     * @param  string  $date  Date in Y-m-d format
     * @return array Summary data with totals and counts
     */
    public function getDailySummary(string $date): array
    {
        $summary = Payment::whereDate('paid_at', $date)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "cash" THEN payments.amount ELSE 0 END), 0) as cash_total,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN payments.amount ELSE 0 END), 0) as mpesa_total,
                COALESCE(SUM(payments.amount), 0) as total_amount,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "cash" THEN 1 END) as cash_count,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN 1 END) as mpesa_count,
                COUNT(*) as total_count
            ')
            ->leftJoin('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->first();

        return [
            'cash_total' => (float) ($summary->cash_total ?? 0),
            'mpesa_total' => (float) ($summary->mpesa_total ?? 0),
            'total_amount' => (float) ($summary->total_amount ?? 0),
            'cash_count' => (int) ($summary->cash_count ?? 0),
            'mpesa_count' => (int) ($summary->mpesa_count ?? 0),
            'total_count' => (int) ($summary->total_count ?? 0),
        ];
    }

    /**
     * Get all payments for a specific date with relationships.
     *
     * @param  string  $date  Date in Y-m-d format
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDailyPayments(string $date)
    {
        return Payment::with(['invoice.visit.patient', 'method', 'mpesaTransaction', 'receivedBy'])
            ->whereDate('paid_at', $date)
            ->orderBy('paid_at', 'desc')
            ->get();
    }

    /**
     * Get cash payments for a specific date.
     *
     * @param  string  $date  Date in Y-m-d format
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCashPayments(string $date)
    {
        return Payment::with(['invoice.visit.patient', 'receivedBy'])
            ->whereDate('paid_at', $date)
            ->whereHas('method', function ($query) {
                $query->whereRaw('LOWER(name) = ?', ['cash']);
            })
            ->orderBy('paid_at', 'desc')
            ->get();
    }

    /**
     * Get M-Pesa payments for a specific date.
     *
     * @param  string  $date  Date in Y-m-d format
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getMpesaPayments(string $date)
    {
        return Payment::with(['invoice.visit.patient', 'mpesaTransaction', 'receivedBy'])
            ->whereDate('paid_at', $date)
            ->whereHas('method', function ($query) {
                $query->whereRaw('LOWER(name) = ?', ['mpesa']);
            })
            ->orderBy('paid_at', 'desc')
            ->get();
    }

    /**
     * Get payment breakdown by staff member for a specific date.
     *
     * @param  string  $date  Date in Y-m-d format
     * @return Collection
     */
    public function getStaffBreakdown(string $date)
    {
        return Payment::whereDate('paid_at', $date)
            ->selectRaw('
                users.id as user_id,
                users.name as user_name,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "cash" THEN payments.amount ELSE 0 END), 0) as cash_total,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN payments.amount ELSE 0 END), 0) as mpesa_total,
                COALESCE(SUM(payments.amount), 0) as total_amount,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "cash" THEN 1 END) as cash_count,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN 1 END) as mpesa_count,
                COUNT(*) as total_count
            ')
            ->leftJoin('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->leftJoin('users', 'payments.received_by', '=', 'users.id')
            ->whereNotNull('payments.received_by')
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_amount', 'desc')
            ->get();
    }

    /**
     * Get complete reconciliation data for a specific date.
     *
     * @param  string  $date  Date in Y-m-d format
     * @return array Complete reconciliation data
     */
    public function getReconciliationData(string $date): array
    {
        return [
            'date' => $date,
            'summary' => $this->getDailySummary($date),
            'cash_payments' => $this->getCashPayments($date),
            'mpesa_payments' => $this->getMpesaPayments($date),
            'staff_breakdown' => $this->getStaffBreakdown($date),
        ];
    }
}
