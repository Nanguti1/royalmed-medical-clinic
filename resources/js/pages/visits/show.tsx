import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle, DollarSign, FileText, Heart, Play, Stethoscope, Thermometer, Trash2, User, XCircle, Flask, Pill, CreditCard } from 'lucide-react';
import type { Visit } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    visit: Visit;
    nextAction: {
        label: string;
        action: string | null;
        permission: string | null;
    };
    userFacingStatus: string;
};

export default function VisitShow() {
    const { visit, nextAction, userFacingStatus } = usePage<PageProps>().props;

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const handleStart = () => {
        router.post(`/visits/${visit.id}/start`, {}, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const handleComplete = () => {
        router.post(`/visits/${visit.id}/complete`, {}, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this visit?')) {
            router.post(`/visits/${visit.id}/cancel`, {}, {
                onSuccess: () => {
                    window.location.href = '/visits';
                },
            });
        }
    };

    const handleAddToQueue = () => {
        router.post(`/visits/${visit.id}/queue`, {
            department: 'consultation',
            priority: 'normal',
        }, {
            onSuccess: () => {
                window.location.href = '/visits/queue';
            },
            onError: (errors) => {
                console.error('Failed to add to queue:', errors);
            }
        });
    };

    const handleTriage = () => {
        window.location.href = `/visits/${visit.id}/triage`;
    };

    const isStarted = visit.started_at !== null;
    const isCompleted = visit.completed_at !== null;
    const isCancelled = visit.cancelled_at !== null;
    const hasVitals = visit.vital_sign !== null;
    const inQueue = visit.queue_entry !== null;

    return (
        <>
            <Head title={`Visit #${visit.id} - ${patientName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/visits">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Visit #{visit.id}</h1>
                            <p className="text-muted-foreground">
                                {patientName} • {new Date(visit.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                            {userFacingStatus}
                        </Badge>
                        {nextAction.action && nextAction.permission && (
                            <PermissionGuard permission={nextAction.permission} fallback={null}>
                                <Badge className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                                    Next: {nextAction.label}
                                </Badge>
                            </PermissionGuard>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {!isCancelled && !isCompleted && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {!isStarted && (
                                    <PermissionGuard permission="visits.update" fallback={null}>
                                        <Button onClick={handleStart}>
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Visit
                                        </Button>
                                    </PermissionGuard>
                                )}
                                {isStarted && (
                                    <PermissionGuard permission="visits.update" fallback={null}>
                                        <Button onClick={handleComplete}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Complete Visit
                                        </Button>
                                    </PermissionGuard>
                                )}
                                {visit.invoice ? (
                                    <Button variant="outline" asChild>
                                        <a href={`/billing/${visit.invoice.id}`}>
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            View Invoice
                                        </a>
                                    </Button>
                                ) : (
                                    <PermissionGuard permission="billing.create" fallback={null}>
                                        <Button variant="outline" asChild>
                                            <a href={`/billing/create/${visit.id}`}>
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                Generate Invoice
                                            </a>
                                        </Button>
                                    </PermissionGuard>
                                )}
                                {!hasVitals && (
                                    <PermissionGuard permission="visits.update" fallback={null}>
                                        <Button variant="outline" onClick={handleTriage}>
                                            <Heart className="mr-2 h-4 w-4" />
                                            Capture Vitals
                                        </Button>
                                    </PermissionGuard>
                                )}
                                {!inQueue && !isStarted && (
                                    <PermissionGuard permission="visits.create" fallback={null}>
                                        <Button variant="outline" onClick={handleAddToQueue}>
                                            <User className="mr-2 h-4 w-4" />
                                            Add to Queue
                                        </Button>
                                    </PermissionGuard>
                                )}
                                <PermissionGuard permission="visits.update" fallback={null}>
                                    <Button variant="destructive" onClick={handleCancel}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Visit
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Visit Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Patient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <Link
                                    href={`/patients/${visit.patient?.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {patientName}
                                </Link>
                            </div>
                            {visit.patient?.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{visit.patient.phone}</p>
                                </div>
                            )}
                            {visit.patient?.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{visit.patient.email}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Visit Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Visit Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Visit Date</p>
                                <p className="font-medium">
                                    {visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visit Number</p>
                                <p className="font-medium">{visit.visit_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium">
                                    {isCancelled
                                        ? 'Cancelled'
                                        : isCompleted
                                            ? 'Completed'
                                            : isStarted
                                                ? 'In Progress'
                                                : 'Pending'}
                                </p>
                            </div>
                            {visit.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="font-medium">{visit.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vital Signs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Vital Signs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.vital_sign ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temperature</p>
                                        <p className="font-medium">{visit.vital_sign.temperature_c || 'N/A'} °C</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                        <p className="font-medium">{visit.vital_sign.blood_pressure || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pulse</p>
                                        <p className="font-medium">{visit.vital_sign.pulse || 'N/A'} bpm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                                        <p className="font-medium">{visit.vital_sign.respiratory_rate || 'N/A'} /min</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{visit.vital_sign.weight_kg || 'N/A'} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Height</p>
                                        <p className="font-medium">{visit.vital_sign.height_cm || 'N/A'} cm</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">No vital signs recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Queue Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Queue Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.queue_entry ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Queue Position</p>
                                        <p className="font-medium">{visit.queue_entry.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="font-medium capitalize">{visit.queue_entry.status}</p>
                                    </div>
                                    {visit.queue_entry.called_at && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Called At</p>
                                            <p className="font-medium">{new Date(visit.queue_entry.called_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">Not in queue.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Workflow Sections */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Triage Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Thermometer className="h-5 w-5" />
                                Triage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.vital_sign ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Vitals Captured</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {visit.vital_sign.temperature_c && `Temp: ${visit.vital_sign.temperature_c}°C`}
                                        {visit.vital_sign.blood_pressure && ` • BP: ${visit.vital_sign.blood_pressure}`}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-muted-foreground">No vitals recorded</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Consultation Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5" />
                                Consultation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.consultation ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Consultation Started</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {visit.consultation.chief_complaint && `Chief Complaint: ${visit.consultation.chief_complaint}`}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-muted-foreground">No consultation started</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Laboratory Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flask className="h-5 w-5" />
                                Laboratory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.lab_orders && visit.lab_orders.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">{visit.lab_orders.length} Lab Order(s)</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {visit.lab_orders.filter((lo: any) => lo.status === 'completed').length} completed
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-muted-foreground">No lab orders</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Prescriptions Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Prescriptions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">{visit.prescriptions.length} Prescription(s)</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {visit.prescriptions.filter((p: any) => p.status === 'finalized').length} finalized
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-muted-foreground">No prescriptions</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pharmacy Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Pharmacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Items ready for dispensing</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {visit.prescriptions.filter((p: any) => p.status === 'finalized').length} pending dispensing
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-muted-foreground">No pharmacy items</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Billing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visit.invoice ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Invoice Generated</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total: {visit.invoice.total_amount} • Due: {visit.invoice.due_amount}
                                    </div>
                                    {visit.invoice.status && (
                                        <Badge variant="outline" className="text-xs">
                                            {visit.invoice.status.name}
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-muted-foreground">No invoice generated</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
