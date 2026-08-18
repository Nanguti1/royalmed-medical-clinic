import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    showRole = false,
}: {
    user: User;
    showEmail?: boolean;
    showRole?: boolean;
}) {
    const getInitials = useInitials();

    const primaryRole = user.roles[0] || 'Staff';
    const roleLabel = primaryRole.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-sidebar-foreground/70">
                        {user.email}
                    </span>
                )}
                {showRole && (
                    <span className="truncate text-xs text-sidebar-foreground/70 capitalize">
                        {roleLabel}
                    </span>
                )}
            </div>
        </>
    );
}
