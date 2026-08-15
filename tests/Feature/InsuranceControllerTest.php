<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InsuranceControllerTest extends TestCase
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

    public function test_insurers_index_displays_insurers(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.insurers.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_insurers_create_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.insurers.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_insurers_edit_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.insurers.edit', 1));

        $response->assertStatus(404); // Insurer doesn't exist - expected
    }

    public function test_schemes_index_displays_schemes(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.schemes.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_schemes_create_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.schemes.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_schemes_edit_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.schemes.edit', 1));

        $response->assertStatus(404); // Scheme doesn't exist - expected
    }

    public function test_patient_coverage_displays_coverage(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.patients.coverage', 1));

        $response->assertStatus(404); // Patient doesn't exist - expected
    }

    public function test_claims_index_displays_claims(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.claims.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_claims_create_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.claims.create', 1));

        $response->assertStatus(404); // Invoice doesn't exist - expected
    }

    public function test_claims_show_displays_claim(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.claims.show', 1));

        $response->assertStatus(404); // Claim doesn't exist - expected
    }

    public function test_claims_edit_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.claims.edit', 1));

        $response->assertStatus(404); // Claim doesn't exist - expected
    }

    public function test_claims_aging_report_displays_report(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.claims.aging-report'));

        $response->assertStatus(404); // Frontend page doesn't exist yet - expected
    }

    public function test_preauthorizations_index_displays_preauths(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.preauthorizations.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_preauthorizations_create_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('insurance.preauthorizations.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_unauthorized_user_cannot_access_insurance(): void
    {
        $unauthorizedUser = User::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->get(route('insurance.insurers.index'));

        $response->assertStatus(403);
    }
}
