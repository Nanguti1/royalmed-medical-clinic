import { Link } from '@inertiajs/react';
import {
    Activity,
    DollarSign,
    FileText,
    FlaskConical,
    LayoutGrid,
    Package,
    Pill,
    Settings,
    Shield,
    Stethoscope,
    Users as UsersIcon,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: null, // Everyone can see dashboard
    },
    {
        title: 'Patients',
        href: '/patients',
        icon: UsersIcon,
        permission: 'patients.view',
    },
    {
        title: 'Visits',
        href: '/visits',
        icon: Stethoscope,
        permission: 'visits.view',
    },
    {
        title: 'Queue',
        href: '/visits/queue',
        icon: Activity,
        permission: 'visits.view',
    },
    {
        title: 'Clinician Desk',
        href: '/consultations',
        icon: FileText,
        permission: 'consultations.view',
    },
    {
        title: 'Prescriptions',
        href: '/prescriptions',
        icon: Pill,
        permission: 'consultations.view',
    },
    {
        title: 'Pharmacy',
        href: '/pharmacy',
        icon: Package,
        permission: 'pharmacy.view',
    },
    {
        title: 'Laboratory',
        href: '/laboratory',
        icon: FlaskConical,
        permission: 'laboratory.view',
    },
    {
        title: 'Billing',
        href: '/billing',
        icon: DollarSign,
        permission: 'billing.view',
    },
    {
        title: 'User Management',
        icon: Shield,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Users',
                href: '/users',
                icon: UsersIcon,
                permission: 'users.view',
            },
            {
                title: 'Roles',
                href: '/roles',
                icon: Shield,
                permission: 'roles.view',
            },
            {
                title: 'Permissions',
                href: '/permissions',
                icon: Settings,
                permission: 'permissions.view',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs',
        icon: FileText,
        permission: null,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
