import { Head, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    User, 
    CheckCircle, 
    AlertTriangle, 
    Users, 
    FileText, 
    Activity,
    LayoutGrid,
    Plus,
    TrendingUp,
    Armchair,
    Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PageProps = {
    stats: {
        today_appointments: number;
        completed_today: number;
        in_progress: number;
        active_treatment_plans: number;
        available_chairs: number;
    };
    inProgressAppointments: Array<{
        id: number;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            hospital_number: string;
        };
        doctor?: {
            first_name: string;
            last_name: string;
        };
        start_time: string;
        end_time: string;
    }>;
    activeTreatmentPlans: Array<{
        id: number;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            hospital_number: string;
        };
        plan_date: string;
        status: string;
        estimated_cost: number;
    }>;
    occupiedChairs: Array<{
        id: number;
        chair_name: string;
        appointment?: {
            patient: {
                first_name: string;
                last_name: string;
            };
            doctor?: {
                first_name: string;
                last_name: string;
            };
        };
    }>;
    upcomingAppointments: Array<{
        id: number;
        patient: {
            first_name: string;
            last_name: string;
            hospital_number: string;
        };
        appointment_date: string;
        start_time: string;
        end_time: string;
        status: string;
        doctor?: {
            first_name: string;
            last_name: string;
        };
    }>;
};

export default function DentalIndex() {
    const { stats, inProgressAppointments, activeTreatmentPlans, occupiedChairs, upcomingAppointments } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Dental Department" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dental Department</h1>
                        <p className="text-muted-foreground">
                            Department overview and treatment management
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/appointments/create?appointment_type=dental">
                                <Plus className="mr-2 h-4 w-4" />
                                New Dental Appointment
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="/dental/treatment-plans/create">
                                <FileText className="mr-2 h-4 w-4" />
                                New Treatment Plan
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Department Statistics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Today's Appointments"
                        value={stats.today_appointments}
                        icon={Calendar}
                        color="blue"
                        description="Scheduled for today"
                    />
                    <StatCard
                        title="Completed Today"
                        value={stats.completed_today}
                        icon={CheckCircle}
                        color="green"
                        description="Treatments completed"
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.in_progress}
                        icon={Activity}
                        color="yellow"
                        description="Currently being treated"
                    />
                    <StatCard
                        title="Active Plans"
                        value={stats.active_treatment_plans}
                        icon={FileText}
                        color="purple"
                        description="Treatment plans active"
                    />
                    <StatCard
                        title="Available Chairs"
                        value={stats.available_chairs}
                        icon={Armchair}
                        color="emerald"
                        description="Chairs available"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* In Progress Treatments */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    In Progress Treatments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inProgressAppointments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No treatments currently in progress
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {inProgressAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                                                onClick={() => (window.location.href = `/appointments/${appointment.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {appointment.patient.first_name} {appointment.patient.last_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {appointment.patient.hospital_number}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{appointment.start_time}</p>
                                                    {appointment.doctor && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
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

                    {/* Upcoming Appointments */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Appointments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingAppointments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No upcoming appointments (next 7 days)
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                                                onClick={() => (window.location.href = `/appointments/${appointment.id}`)}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {appointment.patient.first_name} {appointment.patient.last_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {appointment.patient.hospital_number}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(appointment.status)} variant="outline">
                                                        {appointment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{appointment.start_time} - {appointment.end_time}</span>
                                                    </div>
                                                    {appointment.doctor && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <User className="h-3 w-3" />
                                                            <span>Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Chair Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Armchair className="h-5 w-5" />
                            Chair Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {occupiedChairs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                All chairs available
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {occupiedChairs.map((chair) => (
                                    <div key={chair.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{chair.chair_name}</span>
                                            <Badge variant="destructive" className="text-xs">Occupied</Badge>
                                        </div>
                                        {chair.appointment && (
                                            <div className="text-sm">
                                                <p className="text-muted-foreground">
                                                    {chair.appointment.patient.first_name} {chair.appointment.patient.last_name}
                                                </p>
                                                {chair.appointment.doctor && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Dr. {chair.appointment.doctor.first_name} {chair.appointment.doctor.last_name}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Active Treatment Plans */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Active Treatment Plans
                            </CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <a href="/dental/treatment-plans">View All</a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTreatmentPlans.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No active treatment plans
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeTreatmentPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                                        onClick={() => (window.location.href = `/dental/treatment-plans/${plan.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium">
                                                    {plan.patient.first_name} {plan.patient.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {plan.patient.hospital_number}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(plan.status)}>
                                                {plan.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {new Date(plan.plan_date).toLocaleDateString()}
                                            </span>
                                            <span className="font-medium">
                                                ${plan.estimated_cost.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                                <a href="/dental/treatment-plans">
                                    <FileText className="h-6 w-6" />
                                    <span>Treatment Plans</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                                <a href="/dental/procedures">
                                    <Stethoscope className="h-6 w-6" />
                                    <span>Procedures</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                                <a href="/appointments/schedules/dental">
                                    <Calendar className="h-6 w-6" />
                                    <span>Chair Schedule</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                                <a href="/appointments?appointment_type=dental">
                                    <Users className="h-6 w-6" />
                                    <span>All Appointments</span>
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function StatCard({ title, value, icon: Icon, color, description }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    description: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
