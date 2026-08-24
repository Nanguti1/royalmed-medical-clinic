import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Search, Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { PermissionGuard } from '@/components/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Appointment } from '@/types/appointment';

type PageProps = {
    appointments: {
        data: Appointment[];
        links: any;
        meta: any;
    };
    filters: {
        date?: string;
        doctor_id?: number;
        status?: string;
    };
    doctors: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
};

export default function AppointmentIndex() {
    const { appointments, filters, doctors } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        date: filters.date,
        doctor_id: filters.doctor_id,
        status: filters.status,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/appointments', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'no_show':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'waitlisted':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-3 w-3" />;
            case 'cancelled':
                return <XCircle className="h-3 w-3" />;
            case 'no_show':
                return <AlertTriangle className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    return (
        <>
            <Head title="Appointments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                        <p className="text-muted-foreground">
                            Manage appointments and schedules.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGuard permission="appointments.view" fallback={null}>
                            <Button variant="outline" asChild>
                                <a href="/appointments/calendar">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Calendar
                                </a>
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="appointments.create" fallback={null}>
                            <Button asChild>
                                <a href="/appointments/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Appointment
                                </a>
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-2 text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 text-sm font-medium">Doctor</label>
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
                                                {doctor.first_name} {doctor.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 text-sm font-medium">Status</label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing} className="md:w-auto">
                                Apply Filters
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Appointment List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : appointments.data.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No appointments found"
                        description="Try adjusting your filters or create a new appointment."
                        action={{
                            label: 'New Appointment',
                            onClick: () => (window.location.href = '/appointments/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {appointments.data.map((appointment) => (
                                <AppointmentCard key={appointment.id} appointment={appointment} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {appointments.links && appointments.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {appointments.links.map((link: any, index: number) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function AppointmentCard({ appointment, getStatusColor, getStatusIcon }: { appointment: Appointment; getStatusColor: (status: string) => string; getStatusIcon: (status: string) => React.ReactNode }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/appointments/${appointment.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                    </CardTitle>
                    <Badge className={getStatusColor(appointment.status)}>
                        <span className="flex items-center gap-1">
                            {getStatusIcon(appointment.status)}
                            {appointment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{appointment.patient?.hospital_number}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">{appointment.start_time} - {appointment.end_time}</p>
                    {appointment.doctor && (
                        <p className="text-muted-foreground">Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{appointment.appointment_type.replace('_', ' ')}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
