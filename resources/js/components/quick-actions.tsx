import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Zap, Users, Stethoscope, Pill, Calendar, FileText, Settings } from 'lucide-react';

type QuickAction = {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    shortcut?: string;
    badge?: string;
    danger?: boolean;
};

type QuickActionsProps = {
    actions: QuickAction[];
    primaryAction?: QuickAction;
    maxVisible?: number;
    variant?: 'default' | 'primary' | 'secondary';
    size?: 'default' | 'sm' | 'lg';
    align?: 'start' | 'center' | 'end';
};

export function QuickActions({
    actions,
    primaryAction,
    maxVisible = 3,
    variant = 'default',
    size = 'default',
    align = 'end',
}: QuickActionsProps) {
    const visibleActions = actions.slice(0, maxVisible);
    const hiddenActions = actions.slice(maxVisible);

    const handleActionClick = (action: QuickAction) => {
        action.onClick();
    };

    const getButtonVariant = (action: QuickAction) => {
        if (action.danger) return 'destructive';
        return 'default';
    };

    return (
        <div className="flex items-center gap-2">
            {/* Primary Action */}
            {primaryAction && (
                <Button
                    size={size}
                    onClick={() => handleActionClick(primaryAction)}
                    className="gap-2"
                >
                    {primaryAction.icon}
                    <span>{primaryAction.label}</span>
                    {primaryAction.badge && (
                        <Badge variant="secondary" className="ml-1">
                            {primaryAction.badge}
                        </Badge>
                    )}
                </Button>
            )}

            {/* Visible Actions */}
            {visibleActions.map((action) => (
                <Button
                    key={action.id}
                    variant={variant === 'primary' ? 'default' : variant}
                    size={size}
                    onClick={() => handleActionClick(action)}
                    className={action.danger ? 'text-destructive' : ''}
                >
                    {action.icon}
                    {size !== 'sm' && <span className="ml-2">{action.label}</span>}
                    {action.badge && (
                        <Badge variant="secondary" className="ml-1">
                            {action.badge}
                        </Badge>
                    )}
                </Button>
            ))}

            {/* Dropdown for Hidden Actions */}
            {hiddenActions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={variant} size={size}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={align}>
                        {hiddenActions.map((action) => (
                            <DropdownMenuItem
                                key={action.id}
                                onClick={() => handleActionClick(action)}
                                className={action.danger ? 'text-destructive' : ''}
                            >
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                                {action.shortcut && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        {action.shortcut}
                                    </Badge>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

type QuickActionGroupProps = {
    title: string;
    actions: QuickAction[];
};

export function QuickActionGroup({ title, actions }: QuickActionGroupProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => action.onClick()}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {action.icon}
                        </div>
                        <span className="text-xs">{action.label}</span>
                        {action.badge && (
                            <Badge variant="secondary" className="text-xs">
                                {action.badge}
                            </Badge>
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}

type QuickActionBarProps = {
    actions: QuickAction[];
    align?: 'left' | 'center' | 'right';
};

export function QuickActionBar({ actions, align = 'right' }: QuickActionBarProps) {
    const alignClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    }[align];

    return (
        <div className={`flex items-center gap-2 ${alignClass}`}>
            {actions.map((action) => (
                <Button
                    key={action.id}
                    variant={action.danger ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => action.onClick()}
                    className="gap-2"
                >
                    {action.icon}
                    <span>{action.label}</span>
                    {action.badge && (
                        <Badge variant="secondary" className="ml-1">
                            {action.badge}
                        </Badge>
                    )}
                </Button>
            ))}
        </div>
    );
}

// Preset action groups for common use cases
export const commonQuickActions = {
    navigation: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => (window.location.href = '/dashboard'),
            shortcut: 'D',
        },
        {
            id: 'patients',
            label: 'Patients',
            icon: <Users className="h-4 w-4" />,
            onClick: () => (window.location.href = '/patients'),
            shortcut: 'P',
        },
        {
            id: 'visits',
            label: 'Visits',
            icon: <Stethoscope className="h-4 w-4" />,
            onClick: () => (window.location.href = '/visits'),
            shortcut: 'V',
        },
        {
            id: 'pharmacy',
            label: 'Pharmacy',
            icon: <Pill className="h-4 w-4" />,
            onClick: () => (window.location.href = '/pharmacy'),
            shortcut: 'M',
        },
        {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-4 w-4" />,
            onClick: () => (window.location.href = '/appointments'),
            shortcut: 'A',
        },
    ],
    creation: [
        {
            id: 'new-patient',
            label: 'New Patient',
            icon: <Users className="h-4 w-4" />,
            onClick: () => (window.location.href = '/patients/create'),
        },
        {
            id: 'new-visit',
            label: 'New Visit',
            icon: <Stethoscope className="h-4 w-4" />,
            onClick: () => (window.location.href = '/visits/create'),
        },
        {
            id: 'new-appointment',
            label: 'New Appointment',
            icon: <Calendar className="h-4 w-4" />,
            onClick: () => (window.location.href = '/appointments/create'),
        },
    ],
    settings: [
        {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => (window.location.href = '/settings'),
        },
    ],
};

export function useQuickActions() {
    return {
        commonQuickActions,
    };
}