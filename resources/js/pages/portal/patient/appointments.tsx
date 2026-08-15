import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Calendar,
    Plus,
    Filter,
    X,
    Clock,
    User,
    ChevronRight,
} from 'lucide-react';
import type { PortalAppointment } from '@/types/portal';

type PageProps = {
    appointments: PortalAppointment[];
    filters: {
        status?: string;
        doctor_id?: number;
        date_from?: string;
        date_to?: string;
    };
    doctors: Array<{
        id: number;
        first_name: string;
        last_name: string;
        specialization: string | null;
    }>;
};

export default function PatientAppointments() {
    const { appointments, filters, doctors } = usePage<PageProps>().props;

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>;
            case 'scheduled':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Scheduled</Badge>;
            case 'completed':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Completed</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>;
            case 'no_show':
                return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">No Show</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const clearFilters = () => {
        window.location.href = '/portal/patient/appointments';
    };

    return (
        <>
            <Head title="My Appointments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
                        <p className="text-muted-foreground">
                            View and manage your appointments
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/portal/patient/book-appointment">
                            <Plus className="mr-2 h-4 w-4" />
                            Book Appointment
                        </a>
                    </Button>
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
                                    <option value="scheduled">Scheduled</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_show">No Show</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="doctor">Doctor</Label>
                                <select
                                    id="doctor"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.doctor_id || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('doctor_id', e.target.value);
                                        } else {
                                            url.searchParams.delete('doctor_id');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Doctors</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.first_name} {doctor.last_name}
                                            {doctor.specialization && ` - ${doctor.specialization}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                        </div>
                        {(filters.status || filters.doctor_id || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Appointments List */}
                {appointments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No appointments found</p>
                            <Button variant="link" className="mt-2" asChild>
                                <a href="/portal/patient/book-appointment">Book your first appointment</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {appointments.map((appointment) => (
                            <Card key={appointment.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                <Calendar className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium">
                                                            {appointment.doctor ? 
                                                                `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}` : 
                                                                'Doctor'
                                                            }
                                                        </p>
                                                        {appointment.doctor?.specialization && (
                                                            <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}</span>
                                                    </div>
                                                </div>
                                                {appointment.reason && (
                                                    <p className="text-sm mt-2">
                                                        <span className="text-muted-foreground">Reason:</span> {appointment.reason}
                                                    </p>
                                                )}
                                                {appointment.notes && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {appointment.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/portal/patient/appointments/${appointment.id}`}>
                                                View Details
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </a>
                                        </Button>
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