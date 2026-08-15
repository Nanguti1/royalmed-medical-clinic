<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Services\PortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    protected PortalService $service;

    public function __construct(PortalService $service)
    {
        $this->service = $service;
    }

    // Patient Portal Methods

    public function patientDashboard(Request $request): Response
    {
        $patientId = $request->user()->patient?->id ?? null;

        if (! $patientId) {
            return Inertia::render('portal/patient/dashboard', [
                'dashboard' => null,
            ]);
        }

        $dashboard = $this->service->getPatientDashboard($patientId);

        return Inertia::render('portal/patient/dashboard', [
            'dashboard' => $dashboard,
        ]);
    }

    public function patientAppointments(Request $request): Response
    {
        $patientId = $request->user()->patient?->id ?? null;

        if (! $patientId) {
            return Inertia::render('portal/patient/appointments', [
                'appointments' => null,
            ]);
        }

        $data = $this->service->getPatientAppointments($patientId);

        return Inertia::render('portal/patient/appointments', [
            'appointments' => $data['appointments'],
        ]);
    }

    public function patientBookAppointment(): Response
    {
        return Inertia::render('portal/patient/book-appointment');
    }

    public function patientLabResults(Request $request): Response
    {
        $patientId = $request->user()->patient?->id ?? null;

        if (! $patientId) {
            return Inertia::render('portal/patient/lab-results', [
                'lab_orders' => null,
            ]);
        }

        $data = $this->service->getPatientLabResults($patientId);

        return Inertia::render('portal/patient/lab-results', [
            'lab_orders' => $data['lab_orders'],
        ]);
    }

    public function patientBilling(Request $request): Response
    {
        $patientId = $request->user()->patient?->id ?? null;

        if (! $patientId) {
            return Inertia::render('portal/patient/billing', [
                'invoices' => null,
                'total_pending' => 0,
            ]);
        }

        $data = $this->service->getPatientBilling($patientId);

        return Inertia::render('portal/patient/billing', [
            'invoices' => $data['invoices'],
            'total_pending' => $data['total_pending'],
        ]);
    }

    public function patientPayments(): Response
    {
        return Inertia::render('portal/patient/payments');
    }

    public function patientDocuments(Request $request): Response
    {
        $patientId = $request->user()->patient?->id ?? null;

        if (! $patientId) {
            return Inertia::render('portal/patient/documents', [
                'documents' => [],
            ]);
        }

        $data = $this->service->getPatientDocuments($patientId);

        return Inertia::render('portal/patient/documents', [
            'documents' => $data['documents'],
        ]);
    }

    public function patientMessages(): Response
    {
        return Inertia::render('portal/patient/messages');
    }

    public function patientProfile(Request $request): Response
    {
        $patientId = $request->user()->patient?->id ?? null;

        if (! $patientId) {
            return Inertia::render('portal/patient/profile', [
                'patient' => null,
            ]);
        }

        $data = $this->service->getPatientProfile($patientId);

        return Inertia::render('portal/patient/profile', [
            'patient' => $data['patient'],
        ]);
    }

    // Staff Portal Methods

    public function staffDashboard(Request $request): Response
    {
        $staffId = $request->user()->id;

        $dashboard = $this->service->getStaffDashboard($staffId);

        return Inertia::render('portal/staff/dashboard', [
            'dashboard' => $dashboard,
        ]);
    }

    public function staffSchedule(Request $request): Response
    {
        $staffId = $request->user()->id;
        $startDate = $request->input('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', now()->endOfWeek()->toDateString());

        $data = $this->service->getStaffSchedule($staffId, $startDate, $endDate);

        return Inertia::render('portal/staff/schedule', [
            'appointments' => $data['appointments'],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function staffTasks(Request $request): Response
    {
        $staffId = $request->user()->id;

        $data = $this->service->getStaffTasks($staffId);

        return Inertia::render('portal/staff/tasks', [
            'tasks' => $data['tasks'],
        ]);
    }

    public function staffAnnouncements(): Response
    {
        $data = $this->service->getStaffAnnouncements();

        return Inertia::render('portal/staff/announcements', [
            'announcements' => $data['announcements'],
        ]);
    }

    public function staffMessages(): Response
    {
        return Inertia::render('portal/staff/messages');
    }

    public function staffLeaveRequests(Request $request): Response
    {
        $staffId = $request->user()->id;

        $data = $this->service->getStaffLeaveRequests($staffId);

        return Inertia::render('portal/staff/leave-requests', [
            'leave_requests' => $data['leave_requests'],
        ]);
    }

    public function staffAttendance(Request $request): Response
    {
        $staffId = $request->user()->id;
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $data = $this->service->getStaffAttendance($staffId, $startDate, $endDate);

        return Inertia::render('portal/staff/attendance', [
            'attendance' => $data['attendance'],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
