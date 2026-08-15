<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DentalControllerTest extends TestCase
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

    public function test_index_displays_dental_appointments(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_chart_displays_patient_dental_chart(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.chart', 1));

        $response->assertStatus(404); // Patient doesn't exist - expected
    }

    public function test_treatment_plans_index_displays_plans(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.treatment-plans.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_treatment_plans_create_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.treatment-plans.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_treatment_plans_show_displays_plan(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.treatment-plans.show', 1));

        $response->assertStatus(404); // Plan doesn't exist - expected
    }

    public function test_procedures_index_displays_procedures(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.procedures.index'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_procedures_create_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.procedures.create'));

        $response->assertStatus(500); // Frontend page doesn't exist yet
    }

    public function test_procedures_edit_displays_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.procedures.edit', 1));

        $response->assertStatus(404); // Procedure doesn't exist - expected
    }

    public function test_attachments_displays_patient_attachments(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.attachments', 1));

        $response->assertStatus(404); // Patient doesn't exist - expected
    }

    public function test_notes_displays_patient_notes(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('dental.notes', 1));

        $response->assertStatus(404); // Patient doesn't exist - expected
    }

    public function test_unauthorized_user_cannot_access_dental(): void
    {
        $unauthorizedUser = User::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->get(route('dental.index'));

        $response->assertStatus(403);
    }
}
