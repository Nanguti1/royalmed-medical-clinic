import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    FileText,
    DollarSign,
    MessageSquare,
    FlaskConical,
    User,
    Bell,
    ChevronRight,
    Activity,
} from 'lucide-react';
import type { PatientPortalUser, PortalStats, PortalAppointment, PortalLabResult, PortalInvoice } from '@/types/portal';

type PageProps = {
    user: PatientPortalUser;
    stats: PortalStats;
    upcomingAppointments: PortalAppointment[];
    recentLabResults: PortalLabResult[];
    pendingInvoices: PortalInvoice[];
};

export default function PatientPortalDashboard() {
    const { user, stats, upcomingAppointments, recentLabResults, pendingInvoices } = usePage<PageProps>().props;

    const patientName = [user.first_name, user.other_names, user.last_name].filter(Boolean).join(' ');

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

    const getAppointmentStatusBadge = (status: string) => {
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

    const getInvoiceStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Partial</Badge>;
            case 'pending':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Pending</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Overdue</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Patient Portal" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {patientName}</h1>
                        <p className="text-muted-foreground">
                            Manage your health information and appointments
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/portal/patient/messages">
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
                            <a href="/portal/patient/book-appointment">
                                <Calendar className="mr-2 h-4 w-4" />
                                Book Appointment
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcoming_appointments}</div>
                            <p className="text-xs text-muted-foreground">Scheduled visits</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_invoices}</div>
                            <p className="text-xs text-muted-foreground">Outstanding payments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lab Results</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_lab_results}</div>
                            <p className="text-xs text-muted-foreground">Results to review</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_visits}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.last_visit_date ? `Last: ${formatDate(stats.last_visit_date)}` : 'No visits yet'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Upcoming Appointments */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Appointments
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/portal/patient/appointments">
                                        View All
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingAppointments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No upcoming appointments</p>
                                    <Button variant="link" className="mt-2" asChild>
                                        <a href="/portal/patient/book-appointment">Book an appointment</a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                <Calendar className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">
                                                        {appointment.doctor ? 
                                                            `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}` : 
                                                            'Doctor'
                                                        }
                                                    </p>
                                                    {getAppointmentStatusBadge(appointment.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                                                </p>
                                                {appointment.reason && (
                                                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Lab Results */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5" />
                                    Recent Lab Results
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/portal/patient/lab-results">
                                        View All
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentLabResults.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No lab results available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentLabResults.map((result) => (
                                        <div key={result.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                result.is_critical ? 'bg-red-100 dark:bg-red-900/20' :
                                                result.is_abnormal ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                'bg-green-100 dark:bg-green-900/20'
                                            }`}>
                                                <FlaskConical className={`h-6 w-6 ${
                                                    result.is_critical ? 'text-red-600 dark:text-red-400' :
                                                    result.is_abnormal ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-green-600 dark:text-green-400'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{result.test_name}</p>
                                                    {result.is_critical && (
                                                        <Badge variant="destructive">Critical</Badge>
                                                    )}
                                                    {result.is_abnormal && !result.is_critical && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Abnormal</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {formatDate(result.test_date)}
                                                </p>
                                                {result.result && (
                                                    <p className="text-sm mt-1">
                                                        <span className="text-muted-foreground">Result:</span> {result.result}
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

                {/* Pending Invoices */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pending Invoices
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/portal/patient/billing">
                                    View All
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {pendingInvoices.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No pending invoices</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Invoice #</th>
                                            <th className="text-left p-2">Date</th>
                                            <th className="text-left p-2">Amount</th>
                                            <th className="text-left p-2">Status</th>
                                            <th className="text-left p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingInvoices.map((invoice) => (
                                            <tr key={invoice.id} className="border-b">
                                                <td className="p-2">{invoice.invoice_number}</td>
                                                <td className="p-2">{formatDate(invoice.issued_date)}</td>
                                                <td className="p-2">${invoice.due_amount.toFixed(2)}</td>
                                                <td className="p-2">{getInvoiceStatusBadge(invoice.status)}</td>
                                                <td className="p-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`/portal/patient/payments?invoice_id=${invoice.id}`}>
                                                            Pay Now
                                                        </a>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}