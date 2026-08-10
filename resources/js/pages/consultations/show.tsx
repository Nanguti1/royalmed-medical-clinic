import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, FileText, Heart, Pill, User, FlaskConical } from 'lucide-react';
import type { Consultation } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    consultation: Consultation;
};

export default function ConsultationShow() {
    const { consultation } = usePage<PageProps>().props;

    const patientName = consultation.visit?.patient
        ? [consultation.visit.patient.first_name, consultation.visit.patient.other_names, consultation.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const hasVitals = consultation.visit?.vitalSign !== null;
    const hasPrescriptions = consultation.prescriptions && consultation.prescriptions.length > 0;

    const handleCompleteVisit = () => {
        if (confirm('Are you sure you want to complete this visit? This action cannot be undone.')) {
            router.post(`/consultations/visits/${consultation.visit_id}/complete`, {}, {
                onSuccess: () => {
                    window.location.href = '/consultations';
                },
            });
        }
    };

    return (
        <>
            <Head title={`Consultation #${consultation.id} - ${patientName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/consultations">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Consultation #{consultation.id}</h1>
                            <p className="text-muted-foreground">
                                {patientName} • Visit #{consultation.visit_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGuard permission="consultations.update" fallback={null}>
                            <Button variant="outline" asChild>
                                <a href={`/consultations/${consultation.id}/edit`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Edit
                                </a>
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="visits.update" fallback={null}>
                            <Button onClick={handleCompleteVisit}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Visit
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
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
                                    href={`/patients/${consultation.visit?.patient?.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {patientName}
                                </Link>
                            </div>
                            {consultation.visit?.patient?.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{consultation.visit.patient.phone}</p>
                                </div>
                            )}
                            {consultation.visit?.patient?.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{consultation.visit.patient.email}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vitals Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Vitals Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hasVitals && consultation.visit?.vitalSign ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temperature</p>
                                        <p className="font-medium">{consultation.visit.vitalSign.temperature_c || 'N/A'} °C</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                        <p className="font-medium">{consultation.visit.vitalSign.blood_pressure || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pulse</p>
                                        <p className="font-medium">{consultation.visit.vitalSign.pulse || 'N/A'} bpm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{consultation.visit.vitalSign.weight_kg || 'N/A'} kg</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">No vitals recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Consultation Notes */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Consultation Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {consultation.chief_complaint && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Chief Complaint</p>
                                    <p className="font-medium">{consultation.chief_complaint}</p>
                                </div>
                            )}
                            {consultation.history && (
                                <div>
                                    <p className="text-sm text-muted-foreground">History</p>
                                    <p className="font-medium">{consultation.history}</p>
                                </div>
                            )}
                            {consultation.examination && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Examination</p>
                                    <p className="font-medium">{consultation.examination}</p>
                                </div>
                            )}
                            {consultation.plan && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Plan</p>
                                    <p className="font-medium">{consultation.plan}</p>
                                </div>
                            )}
                            {consultation.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="font-medium">{consultation.notes}</p>
                                </div>
                            )}
                            {!consultation.chief_complaint && !consultation.history && !consultation.examination && !consultation.plan && !consultation.notes && (
                                <p className="text-muted-foreground">No consultation notes recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Prescription Status */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Prescription Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasPrescriptions ? (
                                <div className="space-y-4">
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        {consultation.prescriptions?.length} Prescription(s) Created
                                    </Badge>
                                    <div className="space-y-2">
                                        {consultation.prescriptions?.map((prescription) => (
                                            <Card key={prescription.id} className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">Prescription #{prescription.id}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(prescription.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`/prescriptions/${prescription.id}`}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            View
                                                        </a>
                                                    </Button>
                                                </div>
                                                {prescription.items && prescription.items.length > 0 && (
                                                    <div className="space-y-1 text-sm">
                                                        {prescription.items.slice(0, 3).map((item) => (
                                                            <p key={item.id} className="text-muted-foreground">
                                                                • {item.medicine?.name} {item.quantity} {item.dosageUnit?.abbreviation || ''}
                                                                {item.frequency?.name && ` - ${item.frequency.name}`}
                                                            </p>
                                                        ))}
                                                        {prescription.items.length > 3 && (
                                                            <p className="text-muted-foreground">
                                                                ... and {prescription.items.length - 3} more items
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">No prescriptions created yet.</p>
                                    <PermissionGuard permission="consultations.create" fallback={null}>
                                        <Button variant="outline" asChild>
                                            <a href={`/prescriptions/create/${consultation.visit_id}`}>
                                                <Pill className="mr-2 h-4 w-4" />
                                                Add Prescription
                                            </a>
                                        </Button>
                                    </PermissionGuard>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Laboratory Status */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                Laboratory Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {consultation.visit?.labOrders && consultation.visit.labOrders.length > 0 ? (
                                <div className="space-y-4">
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        {consultation.visit.labOrders.length} Laboratory Order(s) Created
                                    </Badge>
                                    <div className="space-y-2">
                                        {consultation.visit.labOrders.map((labOrder) => (
                                            <Card key={labOrder.id} className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">Lab Order #{labOrder.id}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(labOrder.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge className={
                                                        labOrder.status === 'completed'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : labOrder.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }>
                                                        {labOrder.status === 'completed' ? 'Completed' : labOrder.status === 'in_progress' ? 'Processing' : 'Pending'}
                                                    </Badge>
                                                </div>
                                                {labOrder.items && labOrder.items.length > 0 && (
                                                    <div className="space-y-1 text-sm">
                                                        {labOrder.items.slice(0, 3).map((item) => (
                                                            <p key={item.id} className="text-muted-foreground">
                                                                • {item.test?.name}
                                                                {item.result && ` - ${item.result.result_value}`}
                                                            </p>
                                                        ))}
                                                        {labOrder.items.length > 3 && (
                                                            <p className="text-muted-foreground">
                                                                ... and {labOrder.items.length - 3} more tests
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/laboratory/${labOrder.id}`}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Order
                                                    </a>
                                                </Button>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">No laboratory orders created yet.</p>
                                    <PermissionGuard permission="laboratory.order" fallback={null}>
                                        <Button variant="outline" asChild>
                                            <a href={`/laboratory/create/${consultation.visit_id}`}>
                                                <FlaskConical className="mr-2 h-4 w-4" />
                                                Request Lab Test
                                            </a>
                                        </Button>
                                    </PermissionGuard>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
