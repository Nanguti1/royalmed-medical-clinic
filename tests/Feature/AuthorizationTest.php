<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        $permissions = [
            'patients.view', 'patients.create', 'patients.update', 'patients.delete',
            'visits.view', 'visits.create', 'visits.update',
            'consultations.view', 'consultations.create', 'consultations.update',
            'billing.view', 'billing.create',
            'pharmacy.view', 'pharmacy.dispense',
            'inventory.view', 'inventory.manage',
            'laboratory.view', 'laboratory.order', 'laboratory.result',
            'users.view', 'users.create', 'users.update', 'users.delete',
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            'permissions.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Super Admin role with all permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdminRole->syncPermissions(Permission::all());

        // Create regular user role with limited permissions
        $userRole = Role::firstOrCreate(['name' => 'User']);
        $userRole->syncPermissions([]); // No permissions by default
    }

    public function test_unauthorized_user_cannot_access_patients_index()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/patients');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_access_patients_index()
    {
        $user = User::factory()->create();
        $user->assignRole('User');
        $user->givePermissionTo('patients.view');

        $response = $this->actingAs($user)->get('/patients');

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_create_patient()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/patients/create');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_create_patient()
    {
        $user = User::factory()->create();
        $user->assignRole('User');
        $user->givePermissionTo('patients.create');

        $response = $this->actingAs($user)->get('/patients/create');

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_delete_patient()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $patient = \App\Models\Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $response = $this->actingAs($user)->delete('/patients/'.$patient->id);

        $response->assertStatus(403);
    }

    public function test_super_admin_can_delete_last_super_admin_is_blocked()
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('Super Admin');

        $this->actingAs($superAdmin)
            ->delete('/users/'.$superAdmin->id)
            ->assertSessionHas('error', 'Cannot delete the last Super Admin or yourself.');
    }

    public function test_super_admin_cannot_deactivate_last_super_admin()
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('Super Admin');

        $this->actingAs($superAdmin)
            ->post('/users/'.$superAdmin->id.'/toggle-status')
            ->assertSessionHas('error', 'Cannot deactivate the last Super Admin or yourself.');
    }

    public function test_super_admin_cannot_remove_own_super_admin_role()
    {
        $anotherSuperAdmin = User::factory()->create(['is_active' => true]);
        $anotherSuperAdmin->assignRole('Super Admin');

        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('Super Admin');

        $this->actingAs($superAdmin)
            ->put('/users/'.$superAdmin->id, [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'roles' => [], // Try to remove Super Admin role
            ])
            ->assertSessionHas('error', 'Cannot remove Super Admin role from the last Super Admin or from yourself.');
    }

    public function test_super_admin_role_cannot_be_deleted()
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('Super Admin');

        $superAdminRole = Role::where('name', 'Super Admin')->first();

        $this->actingAs($superAdmin)
            ->delete('/roles/'.$superAdminRole->id)
            ->assertSessionHas('error', 'Cannot delete the Super Admin role.');
    }

    public function test_regular_user_cannot_access_users_index()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/users');

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_users_index()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $response = $this->actingAs($superAdmin)->get('/users');

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_access_billing()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/billing');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_access_billing()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('billing.view');

        $response = $this->actingAs($user)->get('/billing');

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_access_laboratory()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/laboratory');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_access_laboratory()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('laboratory.view');

        $response = $this->actingAs($user)->get('/laboratory');

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_access_pharmacy()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/pharmacy');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_access_pharmacy()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('pharmacy.view');

        $response = $this->actingAs($user)->get('/pharmacy');

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_manage_inventory()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $response = $this->actingAs($user)->get('/pharmacy/receive');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_manage_inventory()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('inventory.manage');

        $response = $this->actingAs($user)->get('/pharmacy/receive');

        $response->assertStatus(200);
    }

    public function test_multiple_super_admins_can_delete_one_another()
    {
        $superAdmin1 = User::factory()->create(['is_active' => true]);
        $superAdmin1->assignRole('Super Admin');

        $superAdmin2 = User::factory()->create(['is_active' => true]);
        $superAdmin2->assignRole('Super Admin');

        $this->actingAs($superAdmin1)
            ->delete('/users/'.$superAdmin2->id)
            ->assertSessionHasNoErrors();
    }

    public function test_regular_user_cannot_delete_any_user()
    {
        $user = User::factory()->create();
        // User has no permissions (no role assigned)

        $targetUser = User::factory()->create();

        $response = $this->actingAs($user)->delete('/users/'.$targetUser->id);

        $response->assertStatus(403);
    }
}
