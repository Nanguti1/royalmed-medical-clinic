import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { PatientCoverage } from '@/types/insurance';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    coverage: PatientCoverage[];
};

export default function PatientCoverage() {
    const { patient, coverage } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={`Patient Coverage - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Patient Insurance Coverage</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                    <Button asChild>
                        <a href={`/insurance/patients/${patient.id}/coverage/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Coverage
                        </a>
                    </Button>
                </div>

                {coverage.length === 0 ? (
                    <EmptyState
                        icon={AlertTriangle}
                        title="No insurance coverage found"
                        description="This patient has no active insurance coverage."
                        action={{
                            label: 'Add Coverage',
                            onClick: () => (window.location.href = `/insurance/patients/${patient.id}/coverage/create`),
                        }}
                    />
                ) : (
                    <div className="grid gap-4">
                        {coverage.map((cov) => (
                            <CoverageCard key={cov.id} coverage={cov} getStatusColor={getStatusColor} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function CoverageCard({ coverage, getStatusColor }: { coverage: PatientCoverage; getStatusColor: (status: string) => string }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {coverage.insurer?.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{coverage.scheme?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        {coverage.is_primary && (
                            <Badge>Primary</Badge>
                        )}
                        <Badge className={getStatusColor(coverage.status)}>
                            {coverage.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Policy Number: {coverage.policy_number}</p>
                    <p className="text-muted-foreground">Policy Type: {coverage.policy_type}</p>
                    <p className="text-muted-foreground">Effective: {new Date(coverage.effective_date).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">Expiry: {new Date(coverage.expiry_date).toLocaleDateString()}</p>
                    {coverage.relationship_to_principal && (
                        <p className="text-muted-foreground">Relationship: {coverage.relationship_to_principal}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
