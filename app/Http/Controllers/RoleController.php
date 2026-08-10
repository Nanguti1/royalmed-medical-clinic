<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Services\UserManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    protected UserManagementService $userManagementService;

    public function __construct(UserManagementService $userManagementService)
    {
        $this->userManagementService = $userManagementService;
    }

    public function index(): Response
    {
        $roles = $this->userManagementService->getRoles();

        return Inertia::render('roles/index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        $permissions = $this->userManagementService->getPermissionsGrouped();

        return Inertia::render('roles/create', [
            'permissions' => $permissions,
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        $this->userManagementService->createRole($request->validated());

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    public function show(Role $role): Response
    {
        $role = $this->userManagementService->getRoleById($role->id);

        return Inertia::render('roles/show', [
            'role' => $role,
        ]);
    }

    public function edit(Role $role): Response
    {
        $role = $this->userManagementService->getRoleById($role->id);
        $permissions = $this->userManagementService->getPermissionsGrouped();

        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        // Prevent modifying Super Admin role directly
        if ($role->name === 'Super Admin') {
            return back()->with('error', 'Cannot modify the Super Admin role.');
        }

        $this->userManagementService->updateRole($role, $request->validated());

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Request $request, Role $role)
    {
        // Prevent deleting Super Admin role
        if ($role->name === 'Super Admin') {
            return back()->with('error', 'Cannot delete the Super Admin role.');
        }

        $this->userManagementService->deleteRole($role);

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
