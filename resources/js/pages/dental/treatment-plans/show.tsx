import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DentalTreatmentPlan } from '@/types/dental';

type PageProps = {
    plan: DentalTreatmentPlan;
};

export default function TreatmentPlanShow() {
    const { plan } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={`Treatment Plan - ${plan.patient?.first_name} ${plan.patient?.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/dental/treatment-plans">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Treatment Plan Details</h1>
                        <p className="text-muted-foreground">
                            {plan.patient?.first_name} {plan.patient?.last_name} ({plan.patient?.hospital_number})
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(plan.status)}>
                            {plan.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Plan Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Plan Date:</span>
                                <span>{new Date(plan.plan_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Procedures:</span>
                                <span>{plan.procedures?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Estimated Cost:</span>
                                <span>${plan.estimated_cost.toLocaleString()}</span>
                            </div>
                            {plan.actual_cost && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Actual Cost:</span>
                                    <span>${plan.actual_cost.toLocaleString()}</span>
                                </div>
                            )}
                            {plan.notes && (
                                <div>
                                    <span className="font-medium">Notes:</span>
                                    <p className="text-muted-foreground">{plan.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Patient Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium">Name</p>
                                <p className="text-muted-foreground">
                                    {plan.patient?.first_name} {plan.patient?.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Hospital Number</p>
                                <p className="text-muted-foreground">{plan.patient?.hospital_number}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`/patients/${plan.patient_id}`}>
                                        View Patient Profile
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`/dental/patients/${plan.patient_id}/chart`}>
                                        View Dental Chart
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Procedures */}
                {plan.procedures && plan.procedures.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Procedures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {plan.procedures.map((procedure) => (
                                    <div key={procedure.id} className="p-4 border rounded">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium">{procedure.procedure?.name}</h3>
                                                <p className="text-sm text-muted-foreground">{procedure.procedure?.code}</p>
                                            </div>
                                            <Badge className={getStatusColor(procedure.status)}>
                                                {procedure.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Badge>
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            {procedure.tooth_number && (
                                                <div className="flex items-center gap-2">
                                                    <span>Tooth:</span>
                                                    <span>#{procedure.tooth_number}</span>
                                                </div>
                                            )}
                                            {procedure.quadrant && (
                                                <div className="flex items-center gap-2">
                                                    <span>Quadrant:</span>
                                                    <span>{procedure.quadrant}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span>Estimated:</span>
                                                <span>${procedure.estimated_cost.toLocaleString()}</span>
                                            </div>
                                            {procedure.actual_cost && (
                                                <div className="flex items-center gap-2">
                                                    <span>Actual:</span>
                                                    <span>${procedure.actual_cost.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        {procedure.notes && (
                                            <p className="text-sm mt-2">{procedure.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {plan.notes && plan.notes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {plan.notes.map((note) => (
                                    <div key={note.id} className="p-3 border rounded">
                                        <p className="text-sm">{note.note}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(note.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <a href="/dental/treatment-plans">Back to List</a>
                            </Button>
                            <Button asChild>
                                <a href={`/dental/treatment-plans/${plan.id}/edit`}>Edit Plan</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
