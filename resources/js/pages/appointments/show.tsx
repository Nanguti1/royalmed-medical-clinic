import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User, Phone, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Appointment } from '@/types/appointment';

type PageProps = {
    appointment: Appointment;
};

export default function AppointmentShow() {
    const { appointment } = usePage<PageProps>().props;

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
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            case 'no_show':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Head title={`Appointment - ${appointment.patient?.first_name} ${appointment.patient?.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/appointments">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
                        <p className="text-muted-foreground">
                            {appointment.patient?.first_name} {appointment.patient?.last_name} ({appointment.patient?.hospital_number})
                        </p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                        <span className="flex items-center gap-1">
                            {getStatusIcon(appointment.status)}
                            {appointment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Appointment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Date:</span>
                                <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Time:</span>
                                <span>{appointment.start_time} - {appointment.end_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Type:</span>
                                <Badge variant="outline">{appointment.appointment_type.replace('_', ' ')}</Badge>
                            </div>
                            {appointment.reason && (
                                <div>
                                    <span className="font-medium">Reason:</span>
                                    <p className="text-muted-foreground">{appointment.reason}</p>
                                </div>
                            )}
                            {appointment.notes && (
                                <div>
                                    <span className="font-medium">Notes:</span>
                                    <p className="text-muted-foreground">{appointment.notes}</p>
                                </div>
                            )}
                            <Separator />
                            <div className="flex flex-wrap gap-2 text-sm">
                                {appointment.is_walk_in && <Badge>Walk-in</Badge>}
                                {appointment.is_follow_up && <Badge>Follow-up</Badge>}
                                {appointment.schedule_reminder && <Badge>Reminder: {appointment.reminder_type}</Badge>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {appointment.doctor ? (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Doctor</p>
                                        <p className="text-muted-foreground">
                                            Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No doctor assigned</p>
                            )}
                            {appointment.dentalChair && (
                                <div>
                                    <p className="font-medium">Dental Chair</p>
                                    <p className="text-muted-foreground">{appointment.dentalChair.chair_name}</p>
                                </div>
                            )}
                            {appointment.visit && (
                                <div>
                                    <p className="font-medium">Visit</p>
                                    <p className="text-muted-foreground">
                                        {new Date(appointment.visit.visit_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {appointment.consultation && (
                                <div>
                                    <p className="font-medium">Consultation</p>
                                    <p className="text-muted-foreground">
                                        {appointment.consultation.diagnosis || 'No diagnosis recorded'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <a href="/appointments">Back to List</a>
                            </Button>
                            <Button asChild>
                                <a href={`/appointments/${appointment.id}/edit`}>Edit Appointment</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
