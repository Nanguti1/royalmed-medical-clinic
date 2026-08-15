import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Bell,
    Filter,
    X,
    Search,
    AlertTriangle,
    Info,
    Clock,
} from 'lucide-react';
import type { StaffAnnouncement } from '@/types/portal';

type PageProps = {
    announcements: StaffAnnouncement[];
    filters: {
        category?: string;
        priority?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function StaffAnnouncements() {
    const { announcements, filters } = usePage<PageProps>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'high':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</Badge>;
            case 'low':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const clearFilters = () => {
        window.location.href = '/portal/staff/announcements';
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <>
            <Head title="Announcements" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                        <p className="text-muted-foreground">
                            Stay updated with important news and updates
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search announcements..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.category || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('category', e.target.value);
                                        } else {
                                            url.searchParams.delete('category');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Categories</option>
                                    <option value="general">General</option>
                                    <option value="policy">Policy</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="event">Event</option>
                                    <option value="training">Training</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.priority || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('priority', e.target.value);
                                        } else {
                                            url.searchParams.delete('priority');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date Range</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    defaultValue={filters.date_from || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('date_from', e.target.value);
                                        } else {
                                            url.searchParams.delete('date_from');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                        </div>
                        {(filters.category || filters.priority || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Announcements List */}
                {announcements.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No announcements found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card
                                key={announcement.id}
                                className={
                                    !announcement.is_active || isExpired(announcement.expires_at)
                                        ? 'opacity-60'
                                        : announcement.priority === 'urgent'
                                        ? 'border-red-500'
                                        : ''
                                }
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                            announcement.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/20' :
                                            announcement.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                            announcement.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                            'bg-blue-100 dark:bg-blue-900/20'
                                        }`}>
                                            {announcement.priority === 'urgent' ? (
                                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            ) : (
                                                <Bell className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-lg">{announcement.title}</p>
                                                <div className="flex gap-2">
                                                    {getPriorityBadge(announcement.priority)}
                                                    {announcement.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {announcement.category}
                                                        </Badge>
                                                    )}
                                                    {!announcement.is_active && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                    {isExpired(announcement.expires_at) && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Expired
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground mb-4">{announcement.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Info className="h-4 w-4" />
                                                    <span>Published: {formatDate(announcement.published_at)}</span>
                                                </div>
                                                {announcement.expires_at && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            Expires: {formatDate(announcement.expires_at)}
                                                            {isExpired(announcement.expires_at) && ' (Expired)'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}