import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { AuthorizationCard } from '@/components/ui/authorization-card';
import { useCan } from '@/hooks/use-permissions';

type Props = {
    permission: string;
    fallback?: ReactNode;
    children: ReactNode;
};

/**
 * Component to conditionally render children based on user permissions.
 * Backend remains authoritative - this is for UX only.
 */
export function PermissionGuard({ permission, fallback, children }: Props) {
    const { auth } = usePage().props;
    const user = auth?.user as any;

    // Super admin bypass
    if (user?.is_super_admin === true) {
        return <>{children}</>;
    }

    const hasPermission = useCan(permission);

    if (!hasPermission) {
        return fallback ?? <AuthorizationCard />;
    }

    return <>{children}</>;
}
