import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Clock, User, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import type { DoctorSchedule } from '@/types/appointment';

type PageProps = {
    schedules: DoctorSchedule[];
    doctors: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
    filters: {
        doctor_id?: number;
        date?: string;
    };
};

export default function DoctorSchedulePage() {
    const { schedules, doctors, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        doctor_id: filters.doctor_id,
        date: filters.date,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get('/appointments/schedules/doctor', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <>
            <Head title="Doctor Schedules" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Doctor Schedules</h1>
                        <p className="text-muted-foreground">
                            Manage doctor availability and working hours.
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
                                <Label htmlFor="doctor_id">Doctor</Label>
                                <Select
                                    value={data.doctor_id?.toString()}
                                    onValueChange={(value) => setData('doctor_id', value ? parseInt(value) : null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All doctors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All doctors</SelectItem>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                Dr. {doctor.first_name} {doctor.last_name}
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
                        description="Select a doctor and date to view their schedule."
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

function ScheduleCard({ schedule, dayNames }: { schedule: DoctorSchedule; dayNames: string[] }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {schedule.doctor ? `Dr. ${schedule.doctor.first_name} ${schedule.doctor.last_name}` : 'Unknown Doctor'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{dayNames[schedule.day_of_week]}</p>
                    </div>
                    <Badge variant={schedule.is_available ? 'default' : 'secondary'}>
                        {schedule.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{schedule.start_time} - {schedule.end_time}</span>
                    </div>
                    {schedule.notes && (
                        <p className="text-muted-foreground">{schedule.notes}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
