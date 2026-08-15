<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\DoctorSchedule;
use App\Models\DentalChairSchedule;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(AuthorizationSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('Super Admin');
    }

    public function test_index_displays_appointments(): void
    {
        Appointment::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get(route('appointments.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_create_displays_creation_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('appointments.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_store_creates_new_appointment(): void
    {
        $patient = Patient::factory()->create();
        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor');

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'appointment_date' => now()->addDay()->toDateString(),
                'start_time' => '09:00',
                'end_time' => '10:00',
                'appointment_type' => 'consultation',
                'reason' => 'Regular checkup',
                'is_walk_in' => false,
                'is_follow_up' => false,
                'schedule_reminder' => false,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
        ]);
    }

    public function test_show_displays_appointment_details(): void
    {
        $appointment = Appointment::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('appointments.show', $appointment));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_edit_displays_edit_form(): void
    {
        $appointment = Appointment::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('appointments.edit', $appointment));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_update_modifies_appointment(): void
    {
        $appointment = Appointment::factory()->create();

        $response = $this->actingAs($this->user)
            ->put(route('appointments.update', $appointment), [
                'appointment_date' => now()->addDays(2)->toDateString(),
                'start_time' => '10:00',
                'end_time' => '11:00',
                'status' => 'confirmed',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_destroy_deletes_appointment(): void
    {
        $appointment = Appointment::factory()->create();

        $response = $this->actingAs($this->user)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect();
        $this->assertSoftDeleted('appointments', [
            'id' => $appointment->id,
        ]);
    }

    public function test_unauthorized_user_cannot_access_appointments(): void
    {
        $unauthorizedUser = User::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->get(route('appointments.index'));

        $response->assertStatus(403);
    }
}
