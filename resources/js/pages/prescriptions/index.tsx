import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Plus, FileText } from 'lucide-react';
import type { Prescription } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    prescriptions: {
        data: Prescription[];
        links: any;
        meta: any;
    };
};

export default function PrescriptionIndex() {
    const { prescriptions } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Prescriptions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
                        <p className="text-muted-foreground">
                            Manage patient prescriptions
                        </p>
                    </div>
                    <PermissionGuard permission="consultations.create" fallback={null}>
                        <Button asChild>
                            <a href="/visits/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Visit
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Prescription List */}
                {prescriptions.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No prescriptions found"
                        description="Prescriptions will appear here when visits are created and prescriptions are issued."
                    />
                ) : (
                    <div className="grid gap-4">
                        {prescriptions.data.map((prescription) => (
                            <PrescriptionCard key={prescription.id} prescription={prescription} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
    const patientName = prescription.visit?.patient
        ? [prescription.visit.patient.first_name, prescription.visit.patient.other_names, prescription.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/prescriptions/${prescription.id}`)}>
            <CardHeader>
                <CardTitle className="text-lg">Prescription #{prescription.prescription_number || prescription.id}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">Patient: {patientName}</p>
                    <p className="text-muted-foreground">Visit #{prescription.visit_id}</p>
                    {prescription.finalized_at && (
                        <p className="text-green-600">Finalized: {new Date(prescription.finalized_at).toLocaleDateString()}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
