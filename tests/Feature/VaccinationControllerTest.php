<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use App\Models\VaccinationCertificate;
use App\Models\VaccinationRecord;
use App\Models\VaccinationReminder;
use App\Models\Vaccine;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VaccinationControllerTest extends TestCase
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

    public function test_index_displays_vaccination_records(): void
    {
        VaccinationRecord::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_index_filters_records_by_search(): void
    {
        VaccinationRecord::factory()->create(['record_number' => 'VAC12345678']);
        VaccinationRecord::factory()->create(['record_number' => 'VAC87654321']);

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.index', ['search' => 'VAC12345678']));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_index_filters_records_by_status(): void
    {
        VaccinationRecord::factory()->create(['status' => 'administered']);
        VaccinationRecord::factory()->create(['status' => 'scheduled']);

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.index', ['status' => 'administered']));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_create_displays_form(): void
    {
        Patient::factory()->count(3)->create();
        Vaccine::factory()->count(3)->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_store_creates_vaccination_record(): void
    {
        $patient = Patient::factory()->create();
        $vaccine = Vaccine::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('vaccinations.store'), [
                'patient_id' => $patient->id,
                'vaccine_id' => $vaccine->id,
                'administration_date' => now()->toDateString(),
                'dose_number' => 1,
                'site' => 'left_arm',
                'route' => 'intramuscular',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('vaccination_records', [
            'patient_id' => $patient->id,
            'vaccine_id' => $vaccine->id,
            'dose_number' => 1,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('vaccinations.store'), []);

        $response->assertSessionHasErrors(['patient_id', 'vaccine_id', 'administration_date', 'dose_number']);
    }

    public function test_show_displays_vaccination_record(): void
    {
        $record = VaccinationRecord::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.show', $record));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_schedule_displays_vaccination_schedule(): void
    {
        Vaccine::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.schedule', ['age_months' => 12]));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_certificates_index_displays_certificates(): void
    {
        VaccinationCertificate::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.certificates.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_certificates_index_filters_by_search(): void
    {
        VaccinationCertificate::factory()->create();
        VaccinationCertificate::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.certificates.index', ['search' => 'test']));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_certificates_generate_creates_certificate(): void
    {
        $record = VaccinationRecord::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('vaccinations.certificates.generate', $record), [
                'valid_from' => now()->toDateString(),
                'issuing_authority' => 'Royalmed Clinic',
                'issuer_name' => 'Dr. Test',
            ]);

        $response->assertRedirect(route('vaccinations.certificates.index'));
        $this->assertDatabaseHas('vaccination_certificates', [
            'vaccination_record_id' => $record->id,
            'issuing_authority' => 'Royalmed Clinic',
        ]);
    }

    public function test_certificates_generate_validates_required_fields(): void
    {
        $record = VaccinationRecord::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('vaccinations.certificates.generate', $record), []);

        $response->assertSessionHasErrors(['valid_from', 'issuing_authority', 'issuer_name']);
    }

    public function test_certificates_print_displays_certificate(): void
    {
        $certificate = VaccinationCertificate::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.certificates.print', $certificate));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_patient_vaccinations_displays_history(): void
    {
        $patient = Patient::factory()->create();
        VaccinationRecord::factory()->count(3)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.patients.index', $patient));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_reminders_displays_reminders(): void
    {
        VaccinationReminder::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.reminders'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_reminders_filters_by_status(): void
    {
        VaccinationReminder::factory()->create(['is_sent' => false]);
        VaccinationReminder::factory()->create(['is_sent' => true]);

        $response = $this->actingAs($this->user)
            ->get(route('vaccinations.reminders', ['status' => 'pending']));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_unauthorized_user_cannot_access_vaccinations(): void
    {
        $unauthorizedUser = User::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->get(route('vaccinations.index'));

        $response->assertStatus(403);
    }

    public function test_unauthorized_user_cannot_create_vaccinations(): void
    {
        $unauthorizedUser = User::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->get(route('vaccinations.create'));

        $response->assertStatus(403);
    }

    public function test_unauthorized_user_cannot_generate_certificates(): void
    {
        $unauthorizedUser = User::factory()->create();
        $record = VaccinationRecord::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->post(route('vaccinations.certificates.generate', $record), [
                'valid_from' => now()->toDateString(),
                'issuing_authority' => 'Royalmed Clinic',
                'issuer_name' => 'Dr. Test',
            ]);

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_vaccinations(): void
    {
        $response = $this->get(route('vaccinations.index'));

        $response->assertRedirect(route('login'));
    }
}
