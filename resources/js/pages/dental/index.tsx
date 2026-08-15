import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Calendar, Clock, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { DentalAppointment } from '@/types/dental';

type PageProps = {
    appointments: DentalAppointment[];
    filters: {
        search?: string;
        date?: string;
    };
};

export default function DentalIndex() {
    const { appointments, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        date: filters.date,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/dental', {
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
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Dental" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dental</h1>
                        <p className="text-muted-foreground">
                            Manage dental appointments and treatments.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/dental/treatment-plans">
                                Treatment Plans
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="/dental/procedures">
                                Procedures
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/appointments/create">
                                New Appointment
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by patient name or hospital number..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="w-auto">
                                <Input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : appointments.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No dental appointments found"
                        description="Try adjusting your search terms or create a new appointment."
                        action={{
                            label: 'New Appointment',
                            onClick: () => (window.location.href = '/appointments/create'),
                        }}
                    />
                ) : (
                    <div className="grid gap-4">
                        {appointments.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} getStatusColor={getStatusColor} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function AppointmentCard({ appointment, getStatusColor }: { appointment: DentalAppointment; getStatusColor: (status: string) => string }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/appointments/${appointment.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{appointment.patient?.hospital_number}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.start_time} - {appointment.end_time}</span>
                    </div>
                    {appointment.dentalChair && (
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.dentalChair.chair_name}</span>
                        </div>
                    )}
                    <Badge variant="outline">{appointment.appointment_type.replace('_', ' ')}</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
