<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;

class PortalService
{
    public function getPatientDashboard(int $patientId): array
    {
        $patient = Patient::find($patientId);

        $upcomingAppointments = Appointment::where('patient_id', $patientId)
            ->where('appointment_date', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('appointment_date')
            ->take(5)
            ->get();

        $recentVisits = Visit::where('patient_id', $patientId)
            ->orderBy('visit_date', 'desc')
            ->take(5)
            ->get();

        $pendingInvoices = Invoice::where('patient_id', $patientId)
            ->where('status', 'pending')
            ->orderBy('invoice_date', 'desc')
            ->get();

        $pendingLabResults = LabOrder::where('patient_id', $patientId)
            ->where('status', 'completed')
            ->whereDoesntHave('results')
            ->orderBy('created_at', 'desc')
            ->get();

        return [
            'patient' => $patient,
            'upcoming_appointments' => $upcomingAppointments,
            'recent_visits' => $recentVisits,
            'pending_invoices' => $pendingInvoices,
            'pending_lab_results' => $pendingLabResults,
        ];
    }

    public function getPatientAppointments(int $patientId): array
    {
        $appointments = Appointment::where('patient_id', $patientId)
            ->orderBy('appointment_date', 'desc')
            ->paginate(20);

        return [
            'appointments' => $appointments,
        ];
    }

    public function getPatientLabResults(int $patientId): array
    {
        $labOrders = LabOrder::where('patient_id', $patientId)
            ->with(['results', 'tests'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return [
            'lab_orders' => $labOrders,
        ];
    }

    public function getPatientBilling(int $patientId): array
    {
        $invoices = Invoice::where('patient_id', $patientId)
            ->orderBy('invoice_date', 'desc')
            ->paginate(20);

        $totalPending = Invoice::where('patient_id', $patientId)
            ->whereHas('status', fn ($q) => $q->where('code', 'unpaid'))
            ->sum('total_amount');

        return [
            'invoices' => $invoices,
            'total_pending' => $totalPending,
        ];
    }

    public function getPatientDocuments(int $patientId): array
    {
        // Placeholder for patient documents
        // Would require a Document model or relation
        return [
            'documents' => [],
        ];
    }

    public function getPatientProfile(int $patientId): array
    {
        $patient = Patient::with(['contacts', 'insurance'])->find($patientId);

        return [
            'patient' => $patient,
        ];
    }

    public function getStaffDashboard(int $staffId): array
    {
        $user = User::find($staffId);

        $todayAppointments = Appointment::where('doctor_id', $staffId)
            ->whereDate('appointment_date', today())
            ->where('status', 'scheduled')
            ->orderBy('appointment_time')
            ->get();

        $upcomingAppointments = Appointment::where('doctor_id', $staffId)
            ->where('appointment_date', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('appointment_date')
            ->take(10)
            ->get();

        $todayVisits = Visit::where('doctor_id', $staffId)
            ->whereDate('visit_date', today())
            ->get();

        return [
            'user' => $user,
            'today_appointments' => $todayAppointments,
            'upcoming_appointments' => $upcomingAppointments,
            'today_visits' => $todayVisits,
        ];
    }

    public function getStaffSchedule(int $staffId, string $startDate, string $endDate): array
    {
        $appointments = Appointment::where('doctor_id', $staffId)
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'scheduled')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        return [
            'appointments' => $appointments,
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }

    public function getStaffTasks(int $staffId): array
    {
        // Placeholder for staff tasks
        // Would require a Task model
        return [
            'tasks' => [],
        ];
    }

    public function getStaffAnnouncements(): array
    {
        // Placeholder for staff announcements
        // Would require an Announcement model
        return [
            'announcements' => [],
        ];
    }

    public function getStaffLeaveRequests(int $staffId): array
    {
        // Placeholder for leave requests
        // Would require a LeaveRequest model
        return [
            'leave_requests' => [],
        ];
    }

    public function getStaffAttendance(int $staffId, string $startDate, string $endDate): array
    {
        // Placeholder for attendance tracking
        // Would require an Attendance model
        return [
            'attendance' => [],
            'period_start' => $startDate,
            'period_end' => $endDate,
        ];
    }
}
