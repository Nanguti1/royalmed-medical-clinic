<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    protected UserManagementService $userManagementService;

    public function __construct(UserManagementService $userManagementService)
    {
        $this->userManagementService = $userManagementService;
    }

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->input('search'),
            'status' => $request->input('status'),
            'role' => $request->input('role'),
        ];

        $users = $this->userManagementService->getUsers($filters);

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $roles = $this->userManagementService->getRoles();

        return Inertia::render('users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $this->userManagementService->createUser($request->validated());

        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function show(User $user): Response
    {
        $user = $this->userManagementService->getUserById($user->id);

        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        $user = $this->userManagementService->getUserById($user->id);
        $roles = $this->userManagementService->getRoles();

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $currentUser = $request->user();
        $targetUser = $this->userManagementService->getUserById($user->id);

        // Check Super Admin safety for role changes
        if (isset($request->validated()['roles'])) {
            $canModify = $this->userManagementService->canModifySuperAdminRole(
                $currentUser,
                $targetUser,
                $request->validated()['roles'],
            );

            if (! $canModify) {
                return back()->with('error', 'Cannot remove Super Admin role from the last Super Admin or from yourself.');
            }
        }

        // Check Super Admin safety for deactivation
        if (isset($request->validated()['is_active']) && ! $request->validated()['is_active']) {
            $canDeactivate = $this->userManagementService->canDeactivateUser($currentUser, $targetUser);

            if (! $canDeactivate) {
                return back()->with('error', 'Cannot deactivate the last Super Admin or yourself.');
            }
        }

        $this->userManagementService->updateUser($targetUser, $request->validated());

        return redirect()
            ->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();
        $targetUser = $this->userManagementService->getUserById($user->id);

        $canDelete = $this->userManagementService->canDeleteSuperAdmin($currentUser, $targetUser);

        if (! $canDelete) {
            return back()->with('error', 'Cannot delete the last Super Admin or yourself.');
        }

        $this->userManagementService->deleteUser($targetUser);

        return redirect()
            ->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    public function toggleStatus(Request $request, User $user)
    {
        $this->authorize('users.update');

        $currentUser = $request->user();
        $targetUser = $this->userManagementService->getUserById($user->id);

        $canToggle = $this->userManagementService->canDeactivateUser($currentUser, $targetUser);

        if (! $canToggle) {
            return back()->with('error', 'Cannot deactivate the last Super Admin or yourself.');
        }

        $this->userManagementService->toggleUserStatus($targetUser);

        return back()->with('success', 'User status updated successfully.');
    }
}
