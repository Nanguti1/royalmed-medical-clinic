Authorization Architecture for Royalmed Clinic

Overview

This document describes using Spatie Laravel Permission as the single authorization system.

1. Installation
- Ensure composer require spatie/laravel-permission is run.
- Publish config and migrations: php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

2. Configuration
- config/permission.php contains table names and cache settings. Use default 'web' guard.

3. Database tables
- roles, permissions, model_has_roles, model_has_permissions, role_has_permissions
- These are created by the package published migration (create_permission_tables.php)

4. User model
- Use Spatie trait: use Spatie\Permission\Traits\HasRoles; and include in User model:
  use HasRoles;
- Do not duplicate relationship methods for roles/permissions.

5. Seeder strategy
- Use database/seeders/AuthorizationSeeder.php to create baseline permissions and roles.
- Super Admin role should be created and given all permissions.

6. Permission naming convention
- Use module.action style, e.g., patients.view, visits.create, pharmacy.dispense.
- Organize permissions by module to ease management and UI grouping.

7. Role strategy
- Assign groups of permissions to named roles (Administrator, Receptionist, Doctor, Pharmacist, Laboratory Technician, Super Admin).
- Prefer role changes over direct user permissions for maintainability.

8. Super Admin bypass
- Implement Gate::before that returns true for users with role 'Super Admin'.
- Place in app/Providers/AuthServiceProvider.php.
- Use sparingly; intended for emergency and full-admin accounts.

9. Permission cache
- Spatie caches permission/role lookups for performance.
- When changing permissions or roles, clear cache: php artisan permission:cache-reset or cache store call.
- Avoid manual cache tinkering; use package commands.

10. Route protection
- Use middleware: Route::middleware('permission:patients.view')->group(...)
- Prefer middleware for simple route-level enforcement.

11. Controller protection
- Use $this->authorize or $user->can('permission') inside controllers.
- Use FormRequest authorize() to gate requests.

12. Inertia integration
- Share roles and permissions in HandleInertiaRequests so React can access them.
  'auth.roles' => fn() => auth()->check() ? auth()->user()->getRoleNames() : []
  'auth.permissions' => fn() => auth()->check() ? auth()->user()->getAllPermissions()->pluck('name') : []

13. React helpers
- Implement helpers (can, hasRole, hasAnyRole, hasPermission, hasAnyPermission) that read shared props and return booleans.
- Use these in UI components; avoid hardcoding logic in components.

14. Best practices
- Use roles to group permissions; assign permissions sparingly to users directly.
- Keep permission names stable; changing names requires updates across code and DB.
- Use environment-specific seeders in development only.

15. Common mistakes
- Creating duplicate custom role/permission tables. Use only Spatie tables.
- Forgetting to clear the permission cache after updates.
- Hardcoding authorization in React components instead of using helpers.

16. Future frontend architecture
- Build an admin UI for roles and permissions, guarded by Super Admin.
- Expose APIs to manage users, roles, and permissions; protect endpoints with middleware.

Appendix: Commands
- Publish: php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
- Reset cache: php artisan permission:cache-reset
- Run seeder: php artisan db:seed --class=AuthorizationSeeder
