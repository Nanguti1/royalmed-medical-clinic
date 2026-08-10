import { usePage } from '@inertiajs/react';
import type { User } from '@/types/auth';

/**
 * Hook to check if the authenticated user has a specific permission.
 * Backend remains authoritative - this is for UX only.
 */
export function useCan(permission: string): boolean {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

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
 * Hook to check if the authenticated user has any of the given permissions.
 */
export function useCanAny(permissions: string[]): boolean {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

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
 * Hook to check if the authenticated user has all of the given permissions.
 */
export function useCanAll(permissions: string[]): boolean {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

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
 * Hook to check if the authenticated user has a specific role.
 */
export function useHasRole(role: string): boolean {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

    if (!user) {
        return false;
    }

    return user.roles.includes(role);
}

/**
 * Hook to check if the authenticated user has any of the given roles.
 */
export function useHasAnyRole(roles: string[]): boolean {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

    if (!user) {
        return false;
    }

    return roles.some((role) => user.roles.includes(role));
}

/**
 * Hook to check if the authenticated user is a Super Admin.
 */
export function useIsSuperAdmin(): boolean {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

    return user?.is_super_admin ?? false;
}

/**
 * Hook to get all permissions of the authenticated user.
 */
export function usePermissions(): string[] {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

    return user?.permissions ?? [];
}

/**
 * Hook to get all roles of the authenticated user.
 */
export function useRoles(): string[] {
    const { auth } = usePage().props;
    const user = auth?.user as User | null;

    return user?.roles ?? [];
}
