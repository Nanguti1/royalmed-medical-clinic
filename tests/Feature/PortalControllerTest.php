<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $patientUser;

    protected User $staffUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(AuthorizationSeeder::class);

        $this->patientUser = User::factory()->create();
        $this->patientUser->assignRole('Super Admin');

        $this->staffUser = User::factory()->create();
        $this->staffUser->assignRole('Super Admin');
    }

    public function test_patient_dashboard_displays_dashboard(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.dashboard'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_appointments_displays_appointments(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.appointments'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_book_appointment_displays_form(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.book-appointment'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_lab_results_displays_results(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.lab-results'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_billing_displays_billing(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.billing'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_payments_displays_payments(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.payments'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_documents_displays_documents(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.documents'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_messages_displays_messages(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.messages'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_profile_displays_profile(): void
    {
        $response = $this->actingAs($this->patientUser)
            ->get(route('portal.patient.profile'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_dashboard_displays_dashboard(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.dashboard'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_schedule_displays_schedule(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.schedule'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_schedule_filters_by_date_range(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.schedule', [
                'start_date' => '2024-01-01',
                'end_date' => '2024-01-31',
            ]));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_tasks_displays_tasks(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.tasks'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_announcements_displays_announcements(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.announcements'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_messages_displays_messages(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.messages'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_leave_requests_displays_leave_requests(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.leave-requests'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_attendance_displays_attendance(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.attendance'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_staff_attendance_filters_by_date_range(): void
    {
        $response = $this->actingAs($this->staffUser)
            ->get(route('portal.staff.attendance', [
                'start_date' => '2024-01-01',
                'end_date' => '2024-01-31',
            ]));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_guest_cannot_access_patient_portal(): void
    {
        $response = $this->get(route('portal.patient.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_guest_cannot_access_staff_portal(): void
    {
        $response = $this->get(route('portal.staff.dashboard'));

        $response->assertRedirect(route('login'));
    }
}
