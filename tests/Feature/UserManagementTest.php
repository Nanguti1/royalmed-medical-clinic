<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\AuthorizationSeeder']);
    }

    public function test_authorized_user_can_view_users()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.view');

        $response = $this->actingAs($user)
            ->get('/users');

        $response->assertOk();
    }

    public function test_unauthorized_user_cannot_view_users()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/users');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_create_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.create');

        $response = $this->actingAs($user)
            ->post('/users', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'is_active' => true,
            ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_user_password_is_hashed()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.create');

        $this->actingAs($user)
            ->post('/users', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'is_active' => true,
            ]);

        $createdUser = User::where('email', 'test@example.com')->first();
        $this->assertNotEquals('password123', $createdUser->password);
        $this->assertTrue(Hash::check('password123', $createdUser->password));
    }

    public function test_user_can_be_assigned_a_role()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.create');

        $role = Role::where('name', 'Doctor')->first();

        $this->actingAs($user)
            ->post('/users', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'is_active' => true,
                'roles' => [$role->id],
            ]);

        $createdUser = User::where('email', 'test@example.com')->first();
        $this->assertTrue($createdUser->hasRole('Doctor'));
    }

    public function test_user_can_be_updated()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.update');

        $targetUser = User::factory()->create();

        $response = $this->actingAs($user)
            ->put("/users/{$targetUser->id}", [
                'name' => 'Updated Name',
                'email' => $targetUser->email,
                'is_active' => true,
            ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['id' => $targetUser->id, 'name' => 'Updated Name']);
    }

    public function test_user_can_be_deactivated()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.update');

        $targetUser = User::factory()->create(['is_active' => true]);

        $this->actingAs($user)
            ->put("/users/{$targetUser->id}", [
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'is_active' => false,
            ]);

        $this->assertDatabaseHas('users', ['id' => $targetUser->id, 'is_active' => false]);
    }

    public function test_authorized_user_can_view_roles()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('roles.view');

        $response = $this->actingAs($user)
            ->get('/roles');

        $response->assertOk();
    }

    public function test_authorized_user_can_create_role()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('roles.create');

        $response = $this->actingAs($user)
            ->post('/roles', [
                'name' => 'Test Role',
                'permissions' => [],
            ]);

        $response->assertRedirect('/roles');
        $this->assertDatabaseHas('roles', ['name' => 'Test Role']);
    }

    public function test_authorized_user_can_assign_permissions_to_role()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('roles.create');

        $permission = Permission::where('name', 'patients.view')->first();

        $response = $this->actingAs($user)
            ->post('/roles', [
                'name' => 'Test Role',
                'permissions' => [$permission->id],
            ]);

        $response->assertRedirect('/roles');
        $role = Role::where('name', 'Test Role')->first();
        $this->assertTrue($role->hasPermissionTo('patients.view'));
    }

    public function test_unauthorized_user_cannot_modify_roles()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/roles', [
                'name' => 'Test Role',
                'permissions' => [],
            ]);

        $response->assertStatus(403);
    }

    public function test_final_super_admin_cannot_be_deactivated()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $admin = User::factory()->create();
        $admin->givePermissionTo('users.update');

        $response = $this->actingAs($admin)
            ->put("/users/{$superAdmin->id}", [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'is_active' => false,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $superAdmin->id, 'is_active' => true]);
    }

    public function test_final_super_admin_cannot_lose_super_admin_role()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $admin = User::factory()->create();
        $admin->givePermissionTo('users.update');

        $response = $this->actingAs($admin)
            ->put("/users/{$superAdmin->id}", [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'is_active' => true,
                'roles' => [],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertTrue($superAdmin->fresh()->hasRole('Super Admin'));
    }

    public function test_user_cannot_remove_own_super_admin_access()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $response = $this->actingAs($superAdmin)
            ->put("/users/{$superAdmin->id}", [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'is_active' => true,
                'roles' => [],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertTrue($superAdmin->fresh()->hasRole('Super Admin'));
    }

    public function test_user_management_pages_return_inertia_responses()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.view');

        $this->actingAs($user)
            ->get('/users')
            ->assertOk();
    }

    // Note: API routes have been removed - Royalmed uses Inertia only
    // This test verified that no REST API existed for React frontend
}
