<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\InsuranceScheme;
use App\Models\Patient;
use App\Models\PatientCoverage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutomationCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_appointment_reminders_command_runs(): void
    {
        $this->artisan('appointments:send-reminders')
            ->assertExitCode(0);
    }

    public function test_vaccination_reminders_command_runs(): void
    {
        $this->artisan('vaccinations:send-reminders')
            ->assertExitCode(0);
    }

    public function test_missed_appointments_command_marks_no_show(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => now()->subDays(2),
            'status' => 'scheduled',
        ]);

        $this->artisan('appointments:check-missed')
            ->assertExitCode(0);

        $this->assertEquals('no_show', $appointment->fresh()->status);
    }

    public function test_low_stock_command_runs(): void
    {
        $this->artisan('inventory:check-low-stock')
            ->assertExitCode(0);
    }

    public function test_expiring_stock_command_runs(): void
    {
        $this->artisan('inventory:check-expiring')
            ->assertExitCode(0);
    }

    public function test_medication_reminders_command_runs(): void
    {
        $this->artisan('medications:send-reminders')
            ->assertExitCode(0);
    }

    public function test_insurance_expiry_command_marks_expired_coverage(): void
    {
        $patient = Patient::factory()->create();
        $scheme = InsuranceScheme::factory()->create();

        $coverage = PatientCoverage::factory()->create([
            'patient_id' => $patient->id,
            'insurance_scheme_id' => $scheme->id,
            'effective_to' => now()->subDays(5),
            'is_active' => true,
        ]);

        $this->artisan('insurance:check-expiry')
            ->assertExitCode(0);

        $this->assertFalse($coverage->fresh()->is_active);
    }

    public function test_billing_notifications_command_runs(): void
    {
        $this->artisan('billing:send-notifications')
            ->assertExitCode(0);
    }

    public function test_critical_lab_results_command_runs(): void
    {
        $this->artisan('laboratory:check-critical-results')
            ->assertExitCode(0);
    }

    public function test_recurring_appointments_command_runs(): void
    {
        $this->artisan('appointments:process-recurring')
            ->assertExitCode(0);
    }
}
