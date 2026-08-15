import { Head, usePage } from '@inertiajs/react';
import { Clock, User, Calendar, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Appointment } from '@/types/appointment';

type PageProps = {
    waitlistEntries: {
        data: Appointment[];
        links: any;
        meta: any;
    };
};

export default function AppointmentWaitlist() {
    const { waitlistEntries } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Waitlist" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Waitlist</h1>
                        <p className="text-muted-foreground">
                            Manage patients on the appointment waitlist.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/appointments">
                                All Appointments
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/appointments/create">
                                New Appointment
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Waitlist */}
                {waitlistEntries.data.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No patients on waitlist"
                        description="The waitlist is currently empty."
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {waitlistEntries.data.map((appointment) => (
                                <WaitlistCard key={appointment.id} appointment={appointment} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {waitlistEntries.links && waitlistEntries.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {waitlistEntries.links.map((link: any, index: number) => (
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

function WaitlistCard({ appointment }: { appointment: Appointment }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{appointment.patient?.hospital_number}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Waitlisted
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Requested: {new Date(appointment.created_at).toLocaleDateString()}</span>
                    </div>
                    {appointment.reason && (
                        <p className="text-muted-foreground">{appointment.reason}</p>
                    )}
                    {appointment.notes && (
                        <p className="text-muted-foreground">{appointment.notes}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                        <Button size="sm" asChild>
                            <a href={`/appointments/${appointment.id}/edit`}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Schedule
                            </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <a href={`/appointments/${appointment.id}`}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Details
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
