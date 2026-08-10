<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserManagementService
{
    public function getUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::with('roles');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('is_active', $filters['status'] === 'active');
        }

        if (isset($filters['role'])) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $filters['role']));
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getUserById(int $id): User
    {
        return User::with('roles', 'permissions')->findOrFail($id);
    }

    public function createUser(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => bcrypt($data['password']),
            'is_active' => $data['is_active'] ?? true,
        ]);

        if (isset($data['roles']) && is_array($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return $user->load('roles');
    }

    public function updateUser(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'is_active' => $data['is_active'] ?? $user->is_active,
        ]);

        if (! empty($data['password'])) {
            $user->update(['password' => bcrypt($data['password'])]);
        }

        if (isset($data['roles']) && is_array($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return $user->load('roles');
    }

    public function toggleUserStatus(User $user): User
    {
        $user->update(['is_active' => ! $user->is_active]);

        return $user;
    }

    public function deleteUser(User $user): void
    {
        $user->delete();
    }

    public function getRoles(): Collection
    {
        return Role::with('permissions')->orderBy('name')->get();
    }

    public function getRoleById(int $id): Role
    {
        return Role::with('permissions')->findOrFail($id);
    }

    public function createRole(array $data): Role
    {
        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        if (isset($data['permissions']) && is_array($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function updateRole(Role $role, array $data): Role
    {
        $role->update(['name' => $data['name']]);

        if (isset($data['permissions']) && is_array($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function deleteRole(Role $role): void
    {
        $role->delete();
    }

    public function getPermissions(): Collection
    {
        return Permission::orderBy('name')->get();
    }

    public function getPermissionsGrouped(): array
    {
        $permissions = $this->getPermissions();

        $grouped = [];
        foreach ($permissions as $permission) {
            $parts = explode('.', $permission->name);
            $module = $parts[0] ?? 'other';
            $action = $parts[1] ?? 'other';

            if (! isset($grouped[$module])) {
                $grouped[$module] = [];
            }

            $grouped[$module][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'action' => $action,
            ];
        }

        return $grouped;
    }

    public function canDeleteSuperAdmin(User $currentUser, User $targetUser): bool
    {
        // Prevent deleting the last Super Admin
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        if (! $superAdminRole) {
            return true;
        }

        $superAdminCount = $superAdminRole->users()->where('is_active', true)->count();

        // If this is the last active Super Admin, prevent deletion
        if ($targetUser->hasRole('Super Admin') && $superAdminCount <= 1) {
            return false;
        }

        // Prevent self-deletion
        if ($currentUser->id === $targetUser->id) {
            return false;
        }

        return true;
    }

    public function canModifySuperAdminRole(User $currentUser, User $targetUser, array $newRoles): bool
    {
        // Check if Super Admin role is being removed
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        if (! $superAdminRole) {
            return true;
        }

        $isRemovingSuperAdmin = $targetUser->hasRole('Super Admin') && ! in_array($superAdminRole->id, $newRoles);

        if (! $isRemovingSuperAdmin) {
            return true;
        }

        // Count active Super Admins after this change
        $superAdminCount = $superAdminRole->users()
            ->where('is_active', true)
            ->where('id', '!=', $targetUser->id)
            ->count();

        // If this would leave no active Super Admins, prevent it
        if ($superAdminCount === 0) {
            return false;
        }

        // Prevent removing own Super Admin role
        if ($currentUser->id === $targetUser->id) {
            return false;
        }

        return true;
    }

    public function canDeactivateUser(User $currentUser, User $targetUser): bool
    {
        // Prevent self-deactivation
        if ($currentUser->id === $targetUser->id) {
            return false;
        }

        // Prevent deactivating the last Super Admin
        if ($targetUser->hasRole('Super Admin')) {
            $superAdminRole = Role::where('name', 'Super Admin')->first();
            if ($superAdminRole) {
                $superAdminCount = $superAdminRole->users()->where('is_active', true)->count();
                if ($superAdminCount <= 1) {
                    return false;
                }
            }
        }

        return true;
    }
}
