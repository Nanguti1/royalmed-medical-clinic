<?php

namespace Tests\Feature;

use App\Models\Prescription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrescriptionAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_user_cannot_create_prescription()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/prescriptions', [
            'visit_id' => 1,
            'items' => [],
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_consultations_create_permission_can_create_prescription()
    {
        $this->markTestSkipped('Requires permissions seeder setup');
    }

    public function test_unauthorized_user_cannot_dispense_prescription()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $prescription = Prescription::factory()->finalized()->create();

        $response = $this->post("/pharmacy/dispense/{$prescription->id}");

        $response->assertStatus(403);
    }

    public function test_user_with_pharmacy_dispense_permission_can_dispense_prescription()
    {
        $this->markTestSkipped('Requires permissions seeder setup');
    }

    public function test_prescription_item_request_uses_correct_permission()
    {
        $this->markTestSkipped('Requires permissions seeder setup');
    }

    public function test_pharmacy_controller_enforces_view_permission()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get('/pharmacy');

        $response->assertStatus(403);
    }

    public function test_pharmacy_controller_allows_view_with_permission()
    {
        $this->markTestSkipped('Requires permissions seeder setup');
    }

    public function test_inventory_controller_enforces_manage_permission()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/pharmacy/receive', [
            'medicine_id' => 1,
            'quantity' => 100,
        ]);

        $response->assertStatus(403);
    }

    public function test_inventory_controller_allows_manage_with_permission()
    {
        $this->markTestSkipped('Requires permissions seeder setup');
    }
}
