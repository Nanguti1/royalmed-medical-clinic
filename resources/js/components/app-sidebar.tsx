import { Link } from '@inertiajs/react';
import {
    Activity,
    Calendar,
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
    Bell,
    BarChart3,
    FileCheck,
    FilePlus,
    User,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
        title: 'Patient Management',
        icon: UsersIcon,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Patients',
                href: '/patients',
                icon: UsersIcon,
                permission: 'patients.view',
            },
            {
                title: 'Appointments',
                href: '/appointments',
                icon: Calendar,
                permission: 'appointments.view',
            },
        ],
    },
    {
        title: 'Clinical Workflow',
        icon: Stethoscope,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Visits',
                href: '/visits',
                icon: User,
                permission: 'visits.view',
            },
            {
                title: 'Waiting Queue',
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
                title: 'Laboratory',
                href: '/laboratory',
                icon: FlaskConical,
                permission: 'laboratory.view',
            },
        ],
    },
    {
        title: 'Pharmacy',
        icon: Package,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Dispensing',
                href: '/pharmacy',
                icon: Package,
                permission: 'pharmacy.view',
            },
            {
                title: 'Inventory',
                href: '/pharmacy/inventory',
                icon: Package,
                permission: 'inventory.view',
            },
            {
                title: 'Medicines',
                href: '/medicines',
                icon: Pill,
                permission: 'inventory.manage',
            },
        ],
    },
    {
        title: 'Billing',
        icon: DollarSign,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Bills',
                href: '/billing',
                icon: DollarSign,
                permission: 'billing.view',
            },
            {
                title: 'Payments',
                href: '/payments',
                icon: DollarSign,
                permission: 'billing.view',
            },
            {
                title: 'Insurance Claims',
                href: '/billing/claims',
                icon: FileText,
                permission: 'insurance.view',
            },
            {
                title: 'Preauthorizations',
                href: '/billing/preauthorizations',
                icon: FilePlus,
                permission: 'insurance.view',
            },
        ],
    },
    {
        title: 'Specialized Services',
        icon: Shield,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Dental',
                href: '/dental',
                icon: LayoutGrid,
                permission: 'dental.view',
            },
            {
                title: 'Vaccinations',
                href: '/vaccinations',
                icon: Bell,
                permission: 'vaccinations.view',
            },
            {
                title: 'Documents',
                href: '/documents',
                icon: FileText,
                permission: 'documents.view',
            },
        ],
    },
    {
        title: 'Administration',
        icon: Settings,
        permission: null, // Group header, individual items have permissions
        items: [
            {
                title: 'Reports',
                href: '/reports',
                icon: BarChart3,
                permission: 'reports.view',
            },
            {
                title: 'Insurance Setup',
                href: '/insurance/insurers',
                icon: Shield,
                permission: 'insurance.view',
            },
            {
                title: 'Users',
                href: '/users',
                icon: UsersIcon,
                permission: 'users.view',
            },
            {
                title: 'Roles & Permissions',
                href: '/roles',
                icon: Shield,
                permission: 'roles.view',
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas" variant="inset">
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
