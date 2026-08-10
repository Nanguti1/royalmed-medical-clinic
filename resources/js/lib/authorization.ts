import type { User } from '@/types/auth';

/**
 * Utility functions for authorization checks.
 * Backend remains authoritative - these are for UX only.
 */

/**
 * Check if a user has a specific permission.
 */
export function can(user: User | null, permission: string): boolean {
    if (!user) {
        return false;
    }

    // Super Admin has all permissions
    if (user.is_super_admin) {
        return true;
    }

    return user.permissions.includes(permission);
}

/**
 * Check if a user has any of the given permissions.
 */
export function canAny(user: User | null, permissions: string[]): boolean {
    if (!user) {
        return false;
    }

    // Super Admin has all permissions
    if (user.is_super_admin) {
        return true;
    }

    return permissions.some((permission) =>
        user.permissions.includes(permission),
    );
}

/**
 * Check if a user has all of the given permissions.
 */
export function canAll(user: User | null, permissions: string[]): boolean {
    if (!user) {
        return false;
    }

    // Super Admin has all permissions
    if (user.is_super_admin) {
        return true;
    }

    return permissions.every((permission) =>
        user.permissions.includes(permission),
    );
}

/**
 * Check if a user has a specific role.
 */
export function hasRole(user: User | null, role: string): boolean {
    if (!user) {
        return false;
    }

    return user.roles.includes(role);
}

/**
 * Check if a user has any of the given roles.
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
    if (!user) {
        return false;
    }

    return roles.some((role) => user.roles.includes(role));
}

/**
 * Check if a user is a Super Admin.
 */
export function isSuperAdmin(user: User | null): boolean {
    return user?.is_super_admin ?? false;
}
