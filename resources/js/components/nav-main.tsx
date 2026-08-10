import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCan } from '@/hooks/use-permissions';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    if (item.items && item.items.length > 0) {
                        // This is a group with nested items
                        const hasVisibleItems = item.items.some(
                            (subItem) => !subItem.permission || useCan(subItem.permission),
                        );

                        if (!hasVisibleItems) {
                            return null;
                        }

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={{ children: item.title }}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    <ChevronRight className="ml-auto" />
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    {item.items
                                        .filter((subItem) => !subItem.permission || useCan(subItem.permission))
                                        .map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isCurrentUrl(subItem.href)}
                                                >
                                                    <Link href={subItem.href} prefetch>
                                                        {subItem.icon && <subItem.icon />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                        );
                    }

                    // This is a regular item
                    if (item.permission && !useCan(item.permission)) {
                        return null;
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
