import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle, DollarSign, FileText, Heart, Play, Stethoscope, Thermometer, Trash2, User, XCircle } from 'lucide-react';
import type { Visit } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    visit: Visit;
};

export default function VisitShow() {
    const { visit } = usePage<PageProps>().props;

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
        router.post(`/visits/${visit.id}/queue`, {}, {
            onSuccess: () => {
                window.location.href = '/visits/queue';
            },
        });
    };

    const handleTriage = () => {
        window.location.href = `/visits/${visit.id}/triage`;
    };

    const isStarted = visit.started_at !== null;
    const isCompleted = visit.completed_at !== null;
    const isCancelled = visit.cancelled_at !== null;
    const hasVitals = visit.vitalSign !== null;
    const inQueue = visit.queueEntry !== null;

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
                        {isCancelled ? (
                            <Badge variant="destructive">Cancelled</Badge>
                        ) : isCompleted ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Completed
                            </Badge>
                        ) : isStarted ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                In Progress
                            </Badge>
                        ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Pending
                            </Badge>
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
                            {visit.vitalSign ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temperature</p>
                                        <p className="font-medium">{visit.vitalSign.temperature_c || 'N/A'} °C</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                        <p className="font-medium">{visit.vitalSign.blood_pressure || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pulse</p>
                                        <p className="font-medium">{visit.vitalSign.pulse || 'N/A'} bpm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                                        <p className="font-medium">{visit.vitalSign.respiratory_rate || 'N/A'} /min</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{visit.vitalSign.weight_kg || 'N/A'} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Height</p>
                                        <p className="font-medium">{visit.vitalSign.height_cm || 'N/A'} cm</p>
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
                            {visit.queueEntry ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Queue Position</p>
                                        <p className="font-medium">{visit.queueEntry.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="font-medium capitalize">{visit.queueEntry.status}</p>
                                    </div>
                                    {visit.queueEntry.called_at && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Called At</p>
                                            <p className="font-medium">{new Date(visit.queueEntry.called_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">Not in queue.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
