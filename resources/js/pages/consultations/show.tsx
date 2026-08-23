import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, FileText, Heart, Pill, User, FlaskConical, Circle, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Consultation } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    consultation: Consultation;
    auth?: {
        user?: {
            id?: number;
            email?: string;
            roles?: string[];
        };
    };
};

type WorkflowStep = {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'pending';
    icon: React.ReactNode;
};

function getWorkflowSteps(consultation: Consultation): WorkflowStep[] {
    const hasPrescriptions = consultation.visit?.prescriptions && consultation.visit.prescriptions.length > 0;
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    const hasLabOrders = consultation.labOrders && consultation.labOrders.length > 0;
    const visitStatus = consultation.visit?.status?.code;
    
    // Determine workflow state based on visit status and prescription state
    const isWaitingForPrescription = visitStatus === 'WAITING_FOR_PRESCRIPTION';
    const isWaitingForPharmacy = visitStatus === 'WAITING_FOR_PHARMACY';
    const isWaitingForLab = visitStatus === 'WAITING_FOR_LAB';
    const isLabInProgress = visitStatus === 'LAB_IN_PROGRESS';
    const isLabResultsReady = visitStatus === 'LAB_RESULTS_READY';
    
    const steps: WorkflowStep[] = [
        {
            id: 'consultation',
            label: 'Consultation',
            status: 'completed',
            icon: <FileText className="h-4 w-4" />,
        },
        {
            id: 'lab',
            label: 'Lab Tests',
            status: 'pending',
            icon: <FlaskConical className="h-4 w-4" />,
        },
        {
            id: 'prescription',
            label: 'Prescription',
            status: 'pending',
            icon: <Pill className="h-4 w-4" />,
        },
        {
            id: 'finalization',
            label: 'Finalization',
            status: 'pending',
            icon: <CheckCircle className="h-4 w-4" />,
        },
        {
            id: 'pharmacy',
            label: 'Pharmacy',
            status: 'pending',
            icon: <FlaskConical className="h-4 w-4" />,
        },
        {
            id: 'billing',
            label: 'Billing',
            status: 'pending',
            icon: <User className="h-4 w-4" />,
        },
    ];

    // Update lab step status
    if (hasLabOrders) {
        if (isLabResultsReady) {
            steps[1].status = 'completed';
        } else if (isLabInProgress) {
            steps[1].status = 'current';
        } else if (isWaitingForLab) {
            steps[1].status = 'current';
        } else {
            steps[1].status = 'completed';
        }
    } else if (isWaitingForLab) {
        steps[1].status = 'current';
    }

    // Update prescription step status
    if (hasPrescriptions) {
        steps[2].status = 'completed';
    } else if (isWaitingForPrescription) {
        steps[2].status = 'current';
    }

    // Update finalization step status
    if (hasFinalizedPrescription) {
        steps[3].status = 'completed';
    } else if (hasPrescriptions && !hasFinalizedPrescription) {
        steps[3].status = 'current';
    }

    // Update pharmacy step status
    if (isWaitingForPharmacy && hasFinalizedPrescription) {
        steps[4].status = 'current';
    } else if (hasFinalizedPrescription) {
        steps[4].status = 'completed';
    }

    // Set the first pending step as current if no current step is set
    if (!steps.some(step => step.status === 'current')) {
        const firstPendingIndex = steps.findIndex(step => step.status === 'pending');
        if (firstPendingIndex !== -1) {
            steps[firstPendingIndex].status = 'current';
        }
    }

    return steps;
}

function getNextActionMessage(consultation: Consultation): string | null {
    const hasPrescriptions = consultation.visit?.prescriptions && consultation.visit.prescriptions.length > 0;
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    const visitStatus = consultation.visit?.status?.code;
    const hasLabOrders = consultation.labOrders && consultation.labOrders.length > 0;

    if (visitStatus === 'WAITING_FOR_LAB') {
        return 'Waiting for lab results';
    }

    if (!hasPrescriptions) {
        return 'Create a prescription to continue the workflow';
    }

    if (!hasFinalizedPrescription) {
        return 'Finalize the prescription to send it to pharmacy';
    }

    if (visitStatus === 'WAITING_FOR_PHARMACY') {
        return 'Go to pharmacy for dispensing';
    }

    if (visitStatus === 'WAITING_FOR_BILLING') {
        return 'Waiting for payment processing';
    }

    return null;
}

function isSuperAdmin(auth?: PageProps['auth']): boolean {
    return auth?.user?.roles?.some((role: string) => 
        role.toLowerCase() === 'super admin' || role === 'Super Admin'
    ) || false;
}

function shouldShowPharmacyButton(consultation: Consultation, auth?: PageProps['auth']): boolean {
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    const visitStatus = consultation.visit?.status?.code;
    return hasFinalizedPrescription && visitStatus === 'WAITING_FOR_PHARMACY';
}

function shouldHideContinueButton(consultation: Consultation): boolean {
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    const visitStatus = consultation.visit?.status?.code;
    const hasLabOrders = consultation.labOrders && consultation.labOrders.length > 0;
    
    // Hide continue button when waiting for lab results
    if (visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS') {
        return true;
    }
    
    return false;
}

function shouldDisableCompleteVisit(consultation: Consultation): boolean {
    const visitStatus = consultation.visit?.status?.code;
    const hasLabOrders = consultation.labOrders && consultation.labOrders.length > 0;
    
    // Disable complete visit when waiting for lab results
    if (visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS') {
        return true;
    }
    
    return false;
}

function shouldDisableCompleteConsultation(consultation: Consultation): boolean {
    const visitStatus = consultation.visit?.status?.code;
    
    // Disable complete consultation when waiting for lab results
    if (visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS') {
        return true;
    }
    
    return false;
}

function shouldDisableCreatePrescription(consultation: Consultation): boolean {
    const visitStatus = consultation.visit?.status?.code;
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    
    // Disable create prescription when waiting for lab results or when prescription is finalized
    if (visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS') {
        return true;
    }
    
    if (hasFinalizedPrescription) {
        return true;
    }
    
    return false;
}

function shouldDisableCreateLabOrder(consultation: Consultation): boolean {
    const visitStatus = consultation.visit?.status?.code;
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    
    // Disable create lab order when waiting for lab results or when prescription is finalized
    if (visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS') {
        return true;
    }
    
    if (hasFinalizedPrescription) {
        return true;
    }
    
    return false;
}

export default function ConsultationShow() {
    const { consultation, auth } = usePage<PageProps>().props;

    const workflowSteps = getWorkflowSteps(consultation);
    const nextActionMessage = getNextActionMessage(consultation);
    const showPharmacyButton = shouldShowPharmacyButton(consultation, auth);
    const hideContinueButton = shouldHideContinueButton(consultation);
    const disableCompleteVisit = shouldDisableCompleteVisit(consultation);
    const disableCompleteConsultation = shouldDisableCompleteConsultation(consultation);
    const disableCreatePrescription = shouldDisableCreatePrescription(consultation);
    const disableCreateLabOrder = shouldDisableCreateLabOrder(consultation);

    const patientName = consultation.visit?.patient
        ? [consultation.visit.patient.first_name, consultation.visit.patient.other_names, consultation.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const hasVitals = consultation.visit?.vital_sign !== null;
    const hasPrescriptions = consultation.visit?.prescriptions && consultation.visit.prescriptions.length > 0;
    const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
    const visitStatus = consultation.visit?.status?.code;

    const handleCompleteVisit = () => {
        if (confirm('Are you sure you want to complete this visit? This action cannot be undone.')) {
            router.post(`/consultations/visits/${consultation.visit_id}/complete`, {}, {
                onSuccess: () => {
                    window.location.href = `/visits/${consultation.visit_id}`;
                },
            });
        }
    };

    const handleCompleteConsultation = () => {
        if (confirm('Are you sure you want to complete this consultation? This will transition the visit to prescription creation.')) {
            router.post(`/consultations/visits/${consultation.visit_id}/complete-consultation`, {}, {
                onSuccess: () => {
                    window.location.href = `/prescriptions/create/${consultation.visit_id}`;
                },
            });
        }
    };

    const handleFinalizePrescription = (prescriptionId: number) => {
        if (confirm('Are you sure you want to finalize this prescription? This will create a pharmacy queue entry and the prescription cannot be modified after finalization.')) {
            router.post(`/prescriptions/${prescriptionId}/finalize`, {}, {
                onSuccess: () => {
                    window.location.reload();
                },
            });
        }
    };

    const handleContinueToNextStep = () => {
        const hasPrescriptions = consultation.visit?.prescriptions && consultation.visit.prescriptions.length > 0;
        const hasFinalizedPrescription = consultation.visit?.prescriptions?.some(p => p.finalized_at);
        const visitStatus = consultation.visit?.status?.code;

        if (!hasPrescriptions) {
            // Navigate to prescription creation
            window.location.href = `/prescriptions/create/${consultation.visit_id}`;
        } else if (!hasFinalizedPrescription) {
            // Scroll to prescription section and highlight finalize button
            const prescriptionSection = document.getElementById('prescription-status');
            if (prescriptionSection) {
                prescriptionSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (visitStatus === 'WAITING_FOR_PHARMACY') {
            // Navigate to pharmacy
            window.location.href = '/pharmacy';
        } else if (visitStatus === 'WAITING_FOR_BILLING') {
            // Navigate to billing
            window.location.href = `/billing/create/${consultation.visit_id}`;
        }
    };

    const handleGoToPharmacy = () => {
        window.location.href = '/pharmacy';
    };

    return (
        <>
            <Head title={`Consultation #${consultation.id} - ${patientName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={`/visits/${consultation.visit_id}`}>
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
                        <PermissionGuard permission="consultations.update" fallback={null}>
                            <Button variant="outline" onClick={handleCompleteConsultation} disabled={disableCompleteConsultation}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Consultation
                            </Button>
                        </PermissionGuard>
                        {!hideContinueButton && (
                            <PermissionGuard permission="consultations.create" fallback={null}>
                                <Button onClick={handleContinueToNextStep} className="bg-blue-600 hover:bg-blue-700">
                                    <ChevronRight className="mr-2 h-4 w-4" />
                                    Continue to Next Step
                                </Button>
                            </PermissionGuard>
                        )}
                        {showPharmacyButton && (
                            <Button onClick={handleGoToPharmacy} className="bg-green-600 hover:bg-green-700">
                                <FlaskConical className="mr-2 h-4 w-4" />
                                Go to Pharmacy
                            </Button>
                        )}
                        <PermissionGuard permission="visits.update" fallback={null}>
                            <Button onClick={handleCompleteVisit} disabled={disableCompleteVisit}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Visit
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Workflow Progress Indicator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Workflow Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            {workflowSteps.map((step, index) => (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`
                                                flex items-center justify-center w-10 h-10 rounded-full border-2
                                                ${step.status === 'completed' 
                                                    ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-500 dark:text-green-300' 
                                                    : step.status === 'current'
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-300 ring-2 ring-blue-300 dark:ring-blue-700'
                                                    : 'bg-gray-50 border-gray-300 text-gray-400 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-500'
                                                }
                                            `}
                                        >
                                            {step.status === 'completed' ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : step.status === 'current' ? (
                                                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span
                                            className={`
                                                text-xs mt-2 text-center font-medium
                                                ${step.status === 'current' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}
                                            `}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < workflowSteps.length - 1 && (
                                        <div className="flex items-center justify-center px-2">
                                            <ChevronRight
                                                className={`
                                                    h-5 w-5
                                                    ${step.status === 'completed' ? 'text-green-500' : 'text-gray-300'}
                                                `}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {nextActionMessage && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Next Step: {nextActionMessage}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                            {hasVitals && consultation.visit?.vital_sign ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temperature</p>
                                        <p className="font-medium">{consultation.visit.vital_sign.temperature_c || 'N/A'} °C</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                        <p className="font-medium">{consultation.visit.vital_sign.blood_pressure || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pulse</p>
                                        <p className="font-medium">{consultation.visit.vital_sign.pulse || 'N/A'} bpm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{consultation.visit.vital_sign.weight_kg || 'N/A'} kg</p>
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
                    <Card className="lg:col-span-2" id="prescription-status">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Prescription Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasPrescriptions ? (
                                <div className="space-y-4">
                                    {hasFinalizedPrescription ? (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Prescription finalized and sent to pharmacy</p>
                                        </div>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {consultation.visit?.prescriptions?.length} Prescription(s) Created
                                        </Badge>
                                    )}
                                    <div className="space-y-2">
                                        {consultation.visit?.prescriptions?.map((prescription) => (
                                            <Card key={prescription.id} className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">Prescription #{prescription.id}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(prescription.created_at).toLocaleDateString()}
                                                        </p>
                                                        <Badge className={
                                                            prescription.finalized_at
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }>
                                                            {prescription.finalized_at ? 'Finalized' : 'Draft'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!prescription.finalized_at && (
                                                            <PermissionGuard permission="consultations.create" fallback={null}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleFinalizePrescription(prescription.id)}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Finalize
                                                                </Button>
                                                            </PermissionGuard>
                                                        )}
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={`/prescriptions/${prescription.id}`}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                View
                                                            </a>
                                                        </Button>
                                                    </div>
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
                                        {disableCreatePrescription ? (
                                            <Button variant="outline" disabled>
                                                <Pill className="mr-2 h-4 w-4" />
                                                Create Prescription
                                            </Button>
                                        ) : (
                                            <Button variant="outline" asChild>
                                                <a href={`/prescriptions/create/${consultation.visit_id}`}>
                                                    <Pill className="mr-2 h-4 w-4" />
                                                    Create Prescription
                                                </a>
                                            </Button>
                                        )}
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
                            {consultation.labOrders && consultation.labOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS' ? (
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Waiting for lab results</p>
                                        </div>
                                    ) : visitStatus === 'LAB_RESULTS_READY' ? (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Lab tests completed</p>
                                        </div>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {consultation.labOrders.length} Laboratory Order(s) Created
                                        </Badge>
                                    )}
                                    <div className="space-y-2">
                                        {consultation.labOrders.map((labOrder) => (
                                            <Card key={labOrder.id} className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">Lab Order #{labOrder.id}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(labOrder.created_at).toLocaleDateString()}
                                                        </p>
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
                                                </div>
                                                {labOrder.items && labOrder.items.length > 0 && (
                                                    <div className="space-y-2">
                                                        {labOrder.items.map((item) => (
                                                            <div key={item.id} className="flex justify-between items-start text-sm">
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{item.test?.name}</p>
                                                                    {item.result && (
                                                                        <div className="mt-1">
                                                                            <span className="font-semibold text-primary">
                                                                                {item.result.result_value}
                                                                            </span>
                                                                            {item.result.units && <span className="text-muted-foreground ml-1">{item.result.units}</span>}
                                                                            {item.result.is_abnormal && (
                                                                                <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                                                                                    Abnormal
                                                                                </Badge>
                                                                            )}
                                                                            {item.result.is_critical && (
                                                                                <Badge className="ml-2 bg-red-600 text-white text-xs">
                                                                                    Critical
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
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
                                    {visitStatus === 'LAB_RESULTS_READY' ? (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Lab tests completed</p>
                                        </div>
                                    ) : visitStatus === 'WAITING_FOR_LAB' || visitStatus === 'LAB_IN_PROGRESS' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                            <p className="text-muted-foreground">Waiting for lab results</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-muted-foreground">No laboratory orders created yet.</p>
                                            <PermissionGuard permission="laboratory.order" fallback={null}>
                                                {disableCreateLabOrder ? (
                                                    <Button variant="outline" disabled>
                                                        <FlaskConical className="mr-2 h-4 w-4" />
                                                        Request Lab Test
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" asChild>
                                                        <a href={`/laboratory/create/${consultation.visit_id}`}>
                                                            <FlaskConical className="mr-2 h-4 w-4" />
                                                            Request Lab Test
                                                        </a>
                                                    </Button>
                                                )}
                                            </PermissionGuard>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
