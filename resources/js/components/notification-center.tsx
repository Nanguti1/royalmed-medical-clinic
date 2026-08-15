import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, Check, CheckCheck, Settings, Info, AlertTriangle, AlertCircle, MessageSquare } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message';

type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
};

type NotificationCenterProps = {
    notifications?: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDismiss?: (id: string) => void;
    onClearAll?: () => void;
};

const notificationIcons: Record<NotificationType, React.ReactNode> = {
    info: <Info className="h-4 w-4 text-blue-500" />,
    success: <Check className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    message: <MessageSquare className="h-4 w-4 text-purple-500" />,
};

const notificationColors: Record<NotificationType, string> = {
    info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    message: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
};

export function NotificationCenter({
    notifications = [],
    onMarkAsRead,
    onMarkAllAsRead,
    onDismiss,
    onClearAll,
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        onMarkAsRead?.(id);
    };

    const handleMarkAllAsRead = () => {
        onMarkAllAsRead?.();
    };

    const handleDismiss = (id: string) => {
        onDismiss?.(id);
    };

    const handleClearAll = () => {
        onClearAll?.();
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="h-8"
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-accent/50 transition-colors ${
                                                !notification.read ? 'bg-accent/30' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {notificationIcons[notification.type]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-sm">{notification.title}</p>
                                                        {!notification.read && (
                                                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => handleDismiss(notification.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {notification.action && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-auto p-0 mt-2"
                                                            onClick={notification.action.onClick}
                                                        >
                                                            {notification.action.label}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="border-t p-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearAll}
                                    className="w-full"
                                >
                                    Clear all notifications
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function useNotificationCenter(initialNotifications: Notification[] = []) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const dismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismiss,
        clearAll,
        unreadCount,
    };
}