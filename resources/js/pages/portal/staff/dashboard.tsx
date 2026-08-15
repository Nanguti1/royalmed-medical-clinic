import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    CheckCircle,
    MessageSquare,
    Clock,
    User,
    Bell,
    ChevronRight,
    Activity,
    CalendarCheck,
    AlertTriangle,
    Info,
} from 'lucide-react';
import type { StaffUser, StaffStats, StaffTask, StaffSchedule, StaffAnnouncement } from '@/types/portal';

type PageProps = {
    user: StaffUser;
    stats: StaffStats;
    upcomingShifts: StaffSchedule[];
    pendingTasks: StaffTask[];
    recentAnnouncements: StaffAnnouncement[];
};

export default function StaffPortalDashboard() {
    const { user, stats, upcomingShifts, pendingTasks, recentAnnouncements } = usePage<PageProps>().props;

    const staffName = [user.first_name, user.other_names, user.last_name].filter(Boolean).join(' ');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getTaskPriorityBadge = (priority: string) => {
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

    const getTaskStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
            case 'pending':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getAnnouncementPriorityBadge = (priority: string) => {
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

    return (
        <>
            <Head title="Staff Portal" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {staffName}</h1>
                        <p className="text-muted-foreground">
                            Staff portal - Manage your work schedule and tasks
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/portal/staff/messages">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Messages
                                {stats.unread_messages > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {stats.unread_messages}
                                    </Badge>
                                )}
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/portal/staff/tasks">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Tasks
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcoming_shifts}</div>
                            <p className="text-xs text-muted-foreground">Scheduled shifts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_tasks}</div>
                            <p className="text-xs text-muted-foreground">Tasks to complete</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.attendance_rate}%</div>
 <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.tasks_completed_this_month}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Upcoming Shifts */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Shifts
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/portal/staff/schedule">
                                        View Schedule
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingShifts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No upcoming shifts scheduled</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingShifts.slice(0, 3).map((shift) => (
                                        <div key={shift.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                <Clock className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{formatDate(shift.date)}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                </p>
                                                {shift.location && (
                                                    <p className="text-sm text-muted-foreground">{shift.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Tasks */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Pending Tasks
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/portal/staff/tasks">
                                        View All Tasks
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pendingTasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No pending tasks</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingTasks.slice(0, 3).map((task) => (
                                        <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium">{task.title}</p>
                                                    <div className="flex gap-2">
                                                        {getTaskPriorityBadge(task.priority)}
                                                        {getTaskStatusBadge(task.status)}
                                                    </div>
                                                </div>
                                                {task.due_date && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Due: {formatDate(task.due_date)}
                                                    </p>
                                                )}
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Announcements */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Recent Announcements
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/portal/staff/announcements">
                                    View All
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentAnnouncements.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No recent announcements</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAnnouncements.slice(0, 3).map((announcement) => (
                                    <div key={announcement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                            announcement.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/20' :
                                            announcement.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                            'bg-blue-100 dark:bg-blue-900/20'
                                        }`}>
                                            <Bell className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium">{announcement.title}</p>
                                                <div className="flex gap-2">
                                                    {getAnnouncementPriorityBadge(announcement.priority)}
                                                    {announcement.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {announcement.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {announcement.content}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDate(announcement.published_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}