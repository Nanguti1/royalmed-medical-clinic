import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Clock,
    Filter,
    X,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import type { AttendanceRecord } from '@/types/portal';

type PageProps = {
    attendanceRecords: AttendanceRecord[];
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        present_days: number;
        absent_days: number;
        late_days: number;
        attendance_rate: number;
    };
};

export default function StaffAttendance() {
    const { attendanceRecords, filters, stats } = usePage<PageProps>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString) return 'N/A';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Present</Badge>;
            case 'absent':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Absent</Badge>;
            case 'late':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Late</Badge>;
            case 'early_leave':
                return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Early Leave</Badge>;
            case 'half_day':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Half Day</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
            case 'absent':
                return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
            case 'late':
                return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
            case 'early_leave':
                return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
            case 'half_day':
                return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    const clearFilters = () => {
        window.location.href = '/portal/staff/attendance';
    };

    const handleCheckIn = () => {
        window.location.href = '/portal/staff/attendance/check-in';
    };

    const handleCheckOut = () => {
        window.location.href = '/portal/staff/attendance/check-out';
    };

    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords.find(r => r.date === today);

    return (
        <>
            <Head title="Attendance" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                        <p className="text-muted-foreground">
                            Track your attendance and work hours
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!todayRecord?.check_in_time && (
                            <Button onClick={handleCheckIn}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Check In
                            </Button>
                        )}
                        {todayRecord?.check_in_time && !todayRecord?.check_out_time && (
                            <Button onClick={handleCheckOut} variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Check Out
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.present_days}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.absent_days}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Late Days</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.late_days}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.attendance_rate}%</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Status */}
                {todayRecord && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Today's Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(todayRecord.status)}
                                    <div>
                                        <p className="font-medium">{todayRecord.status.replace('_', ' ').toUpperCase()}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>Check In: {formatTime(todayRecord.check_in_time)}</span>
                                            <span>Check Out: {formatTime(todayRecord.check_out_time)}</span>
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(todayRecord.status)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search records..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.status || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('status', e.target.value);
                                        } else {
                                            url.searchParams.delete('status');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="early_leave">Early Leave</option>
                                    <option value="half_day">Half Day</option>
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
                        {(filters.status || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance Records */}
                {attendanceRecords.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No attendance records found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4">Date</th>
                                    <th className="text-left p-4">Check In</th>
                                    <th className="text-left p-4">Check Out</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map((record) => (
                                    <tr key={record.id} className="border-b hover:bg-accent/50">
                                        <td className="p-4">{formatDate(record.date)}</td>
                                        <td className="p-4">{formatTime(record.check_in_time)}</td>
                                        <td className="p-4">{formatTime(record.check_out_time)}</td>
                                        <td className="p-4">{getStatusBadge(record.status)}</td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}