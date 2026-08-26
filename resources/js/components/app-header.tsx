import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    FileText,
    FlaskConical,
    LayoutGrid,
    Menu,
    Package,
    Pill,
    Search,
    Stethoscope,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useCan } from '@/hooks/use-permissions';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: null,
    },
    {
        title: 'Patients',
        href: '/patients',
        icon: Users,
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
];

const rightNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs',
        icon: FileText,
        permission: null,
    },
];

const activeItemStyles =
    'text-primary bg-primary/10 dark:bg-primary/20 dark:text-primary-foreground';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    const filteredMainNavItems = mainNavItems.filter(
        (item) => !item.permission || useCan(item.permission),
    );
    const filteredRightNavItems = rightNavItems.filter(
        (item) => !item.permission || useCan(item.permission),
    );

    return (
        <>
            <div className="border-b border-border bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden">
                                            <AppLogoIcon className="h-6 w-6 object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white">{page.props.name || 'Royalmed'}</span>
                                            <span className="text-xs text-sidebar-foreground/70">Medical Clinic</span>
                                        </div>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {filteredMainNavItems.map(
                                                (item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className="flex items-center space-x-2 font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                                                    >
                                                        {item.icon && (
                                                            <item.icon className="h-5 w-5" />
                                                        )}
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                ),
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {filteredRightNavItems.map(
                                                (item) => (
                                                    <a
                                                        key={item.title}
                                                        href={toUrl(item.href)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                                                    >
                                                        {item.icon && (
                                                            <item.icon className="h-5 w-5" />
                                                        )}
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                        <div className="hidden md:flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{page.props.name || 'Royalmed'}</span>
                            <span className="text-xs text-muted-foreground">Medical Clinic</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-8 hidden h-full items-center space-x-1 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                {filteredMainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-4 rounded-md transition-all duration-200',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-primary"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer hover:bg-muted"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100 text-foreground" />
                            </Button>
                            <div className="ml-1 hidden gap-1 lg:flex">
                                {filteredRightNavItems.map((item) => (
                                    <Tooltip key={item.title}>
                                        <TooltipTrigger>
                                            <a
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-muted-foreground ring-offset-background transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                <span className="sr-only">
                                                    {item.title}
                                                </span>
                                                {item.icon && (
                                                    <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                )}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1 hover:bg-muted"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-muted text-foreground">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-border bg-muted/30">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-muted-foreground md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
