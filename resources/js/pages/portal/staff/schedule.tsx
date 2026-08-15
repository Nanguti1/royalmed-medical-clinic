import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Calendar,
    Clock,
    MapPin,
    Filter,
    X,
    Search,
    ChevronRight,
} from 'lucide-react';
import type { StaffSchedule } from '@/types/portal';

type PageProps = {
    schedules: StaffSchedule[];
    filters: {
        date_from?: string;
        date_to?: string;
        location?: string;
    };
};

export default function StaffSchedule() {
    const { schedules, filters } = usePage<PageProps>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
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

    const clearFilters = () => {
        window.location.href = '/portal/staff/schedule';
    };

    const groupSchedulesByDate = () => {
        const grouped: Record<string, StaffSchedule[]> = {};
        schedules.forEach(schedule => {
            const date = schedule.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(schedule);
        });
        return grouped;
    };

    const groupedSchedules = groupSchedulesByDate();
    const sortedDates = Object.keys(groupedSchedules).sort();

    return (
        <>
            <Head title="My Schedule" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
                        <p className="text-muted-foreground">
                            View and manage your work schedule
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
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">From Date</Label>
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
                            <div className="space-y-2">
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    defaultValue={filters.date_to || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('date_to', e.target.value);
                                        } else {
                                            url.searchParams.delete('date_to');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    placeholder="Filter by location"
                                    defaultValue={filters.location || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('location', e.target.value);
                                        } else {
                                            url.searchParams.delete('location');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                        </div>
                        {(filters.date_from || filters.date_to || filters.location) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Schedule List */}
                {schedules.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No scheduled shifts found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {sortedDates.map((date) => (
                            <div key={date}>
                                <h3 className="text-lg font-semibold mb-4">{formatDate(date)}</h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {groupedSchedules[date].map((schedule) => (
                                        <Card key={schedule.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                        <Clock className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="font-medium">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</p>
                                                        </div>
                                                        {schedule.location && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{schedule.location}</span>
                                                            </div>
                                                        )}
                                                        {schedule.notes && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {schedule.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}