<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\User;
use App\Services\AppointmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected AppointmentService $appointmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->appointmentService = app(AppointmentService::class);
    }

    public function test_appointment_can_be_created(): void
    {
        $patient = Patient::factory()->create();
        $doctor = User::factory()->create();

        $appointment = $this->appointmentService->createAppointment([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDays(2),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'appointment_type' => 'consultation',
            'reason' => 'General checkup',
        ]);

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'status' => 'scheduled',
        ]);

        $this->assertNotNull($appointment->appointment_number);
    }

    public function test_double_booking_is_prevented(): void
    {
        $patient = Patient::factory()->create();
        $doctor = User::factory()->create();

        $this->appointmentService->createAppointment([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDays(2),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'appointment_type' => 'consultation',
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Double booking detected');

        $this->appointmentService->createAppointment([
            'patient_id' => Patient::factory()->create()->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDays(2),
            'start_time' => '09:30',
            'end_time' => '10:30',
            'appointment_type' => 'consultation',
        ]);
    }

    public function test_appointment_can_be_cancelled(): void
    {
        $appointment = Appointment::factory()->create(['status' => 'scheduled']);

        $this->appointmentService->cancelAppointment($appointment, 'Patient requested cancellation');

        $this->assertEquals('cancelled', $appointment->fresh()->status);
        $this->assertEquals('Patient requested cancellation', $appointment->fresh()->cancellation_reason);
    }

    public function test_appointment_can_be_confirmed(): void
    {
        $appointment = Appointment::factory()->create(['status' => 'scheduled']);

        $this->appointmentService->confirmAppointment($appointment);

        $this->assertEquals('confirmed', $appointment->fresh()->status);
    }

    public function test_appointment_can_be_marked_as_no_show(): void
    {
        $appointment = Appointment::factory()->create(['status' => 'scheduled']);

        $this->appointmentService->markAsNoShow($appointment);

        $this->assertEquals('no_show', $appointment->fresh()->status);
    }

    public function test_appointment_check_in(): void
    {
        $appointment = Appointment::factory()->create(['status' => 'confirmed']);

        $appointment->checkIn();

        $this->assertEquals('in_progress', $appointment->status);
        $this->assertNotNull($appointment->checked_in_at);
    }

    public function test_appointment_check_out(): void
    {
        $appointment = Appointment::factory()->create(['status' => 'in_progress']);

        $appointment->checkOut();

        $this->assertEquals('completed', $appointment->status);
        $this->assertNotNull($appointment->checked_out_at);
    }

    public function test_walk_in_appointment(): void
    {
        $appointment = Appointment::factory()->create(['is_walk_in' => true]);

        $this->assertTrue($appointment->is_walk_in);
    }

    public function test_follow_up_appointment(): void
    {
        $appointment = Appointment::factory()->create(['is_follow_up' => true]);

        $this->assertTrue($appointment->is_follow_up);
    }

    public function test_waitlist_entry_can_be_created(): void
    {
        $patient = Patient::factory()->create();

        $entry = $this->appointmentService->addToWaitlist([
            'patient_id' => $patient->id,
            'appointment_type' => 'consultation',
            'reason' => 'Patient requested urgent appointment',
            'priority' => 'high',
        ]);

        $this->assertDatabaseHas('waitlist_entries', [
            'patient_id' => $patient->id,
            'priority' => 'high',
            'status' => 'pending',
        ]);
    }

    public function test_available_slots_can_be_retrieved(): void
    {
        $doctor = User::factory()->create();
        DoctorSchedule::factory()->create([
            'doctor_id' => $doctor->id,
            'day_of_week' => now()->addDay()->format('l'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $slots = $this->appointmentService->getAvailableSlots($doctor->id, now()->addDay()->toDateString());

        $this->assertIsArray($slots);
        $this->assertNotEmpty($slots);
    }

    public function test_appointment_reminder_is_scheduled(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => now()->addDays(2),
        ]);

        $reminder = $this->appointmentService->scheduleReminder($appointment, 'sms');

        $this->assertDatabaseHas('appointment_reminders', [
            'appointment_id' => $appointment->id,
            'reminder_type' => 'sms',
            'is_sent' => false,
        ]);
    }

    public function test_appointment_overlaps_with_another(): void
    {
        $doctor = User::factory()->create();
        $date = now()->addDays(2);

        $appointment1 = Appointment::factory()->create([
            'doctor_id' => $doctor->id,
            'appointment_date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
        ]);

        $appointment2 = Appointment::factory()->create([
            'doctor_id' => $doctor->id,
            'appointment_date' => $date,
            'start_time' => '09:30',
            'end_time' => '10:30',
        ]);

        $this->assertTrue($appointment1->overlapsWith($appointment2));
    }

    public function test_appointment_duration_is_calculated(): void
    {
        $appointment = Appointment::factory()->create([
            'start_time' => '09:00',
            'end_time' => '10:30',
        ]);

        $this->assertEquals(90, $appointment->duration);
    }
}
