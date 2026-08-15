import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import type { DentalChairSchedule } from '@/types/appointment';

type PageProps = {
    schedules: DentalChairSchedule[];
    chairs: Array<{
        id: number;
        chair_name: string;
    }>;
    filters: {
        chair_id?: number;
        date?: string;
    };
};

export default function DentalSchedulePage() {
    const { schedules, chairs, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        chair_id: filters.chair_id,
        date: filters.date,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get('/appointments/schedules/dental', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <>
            <Head title="Dental Chair Schedules" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dental Chair Schedules</h1>
                        <p className="text-muted-foreground">
                            Manage dental chair availability and schedules.
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/appointments">
                            Back to Appointments
                        </a>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <Label htmlFor="chair_id">Dental Chair</Label>
                                <Select
                                    value={data.chair_id?.toString()}
                                    onValueChange={(value) => setData('chair_id', value ? parseInt(value) : null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All chairs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All chairs</SelectItem>
                                        {chairs.map((chair) => (
                                            <SelectItem key={chair.id} value={chair.id.toString()}>
                                                {chair.chair_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Schedules */}
                {schedules.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No schedules found"
                        description="Select a dental chair and date to view its schedule."
                    />
                ) : (
                    <div className="grid gap-4">
                        {schedules.map((schedule) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} dayNames={dayNames} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function ScheduleCard({ schedule, dayNames }: { schedule: DentalChairSchedule; dayNames: string[] }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{schedule.chair_name}</CardTitle>
                        {schedule.location && (
                            <p className="text-sm text-muted-foreground">{schedule.location}</p>
                        )}
                    </div>
                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    {schedule.description && (
                        <p className="text-muted-foreground">{schedule.description}</p>
                    )}
                    {schedule.schedules && schedule.schedules.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <p className="font-medium">Schedule Slots:</p>
                            {schedule.schedules.map((slot) => (
                                <div key={slot.id} className="flex items-center gap-2 p-2 border rounded">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{dayNames[slot.day_of_week]}: {slot.start_time} - {slot.end_time}</span>
                                    <Badge variant={slot.is_available ? 'default' : 'secondary'}>
                                        {slot.is_available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
