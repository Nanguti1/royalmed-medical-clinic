<?php

namespace App\Http\Controllers;

use App\Services\UserManagementService;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    protected UserManagementService $userManagementService;

    public function __construct(UserManagementService $userManagementService)
    {
        $this->userManagementService = $userManagementService;
    }

    public function index(): Response
    {
        $permissions = $this->userManagementService->getPermissionsGrouped();

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
        ]);
    }
}
