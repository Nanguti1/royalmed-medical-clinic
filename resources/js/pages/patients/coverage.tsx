import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Plus,
    Calendar,
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText,
} from 'lucide-react';

type PatientCoverage = {
    id: number;
    patient_id: number;
    insurer_id: number;
    scheme_id: number;
    policy_number: string;
    policy_holder_name: string;
    policy_holder_relationship: string;
    effective_date: string;
    expiry_date: string | null;
    is_active: boolean;
    coverage_limit: number | null;
    created_at: string;
    updated_at: string;
    insurer?: {
        id: number;
        name: string;
    };
    scheme?: {
        id: number;
        name: string;
    };
};

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
    };
    coverages: PatientCoverage[];
};

export default function PatientCoverage() {
    const { patient, coverages } = usePage<PageProps>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isExpired = (expiryDate: string | null) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const getStatusBadge = (coverage: PatientCoverage) => {
        if (!coverage.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        if (isExpired(coverage.expiry_date)) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
    };

    return (
        <>
            <Head title="Patient Coverage" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Insurance Coverage</h2>
                        <p className="text-muted-foreground">
                            Manage patient insurance policies and coverage
                        </p>
                    </div>
                    <Button asChild>
                        <a href={`/patients/${patient.id}/coverage/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Coverage
                        </a>
                    </Button>
                </div>

                {coverages.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No insurance coverage on file</p>
                            <Button variant="link" className="mt-2" asChild>
                                <a href={`/patients/${patient.id}/coverage/create`}>Add first coverage</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {coverages.map((coverage) => (
                            <Card key={coverage.id} className={!coverage.is_active || isExpired(coverage.expiry_date) ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                coverage.is_active && !isExpired(coverage.expiry_date) ? 'bg-green-100 dark:bg-green-900/20' :
                                                'bg-gray-100 dark:bg-gray-900/20'
                                            }`}>
                                                <Shield className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CardTitle className="text-lg">{coverage.insurer?.name || 'Unknown Insurer'}</CardTitle>
                                                    {getStatusBadge(coverage)}
                                                </div>
                                                {coverage.scheme && (
                                                    <p className="text-sm text-muted-foreground">{coverage.scheme.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Policy Number</p>
                                            <p className="font-medium">{coverage.policy_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Policy Holder</p>
                                            <p className="font-medium">{coverage.policy_holder_name}</p>
                                            <p className="text-sm text-muted-foreground">Relationship: {coverage.policy_holder_relationship}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Effective Date</p>
                                            <p className="font-medium">{formatDate(coverage.effective_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Expiry Date</p>
                                            <p className="font-medium">
                                                {coverage.expiry_date ? formatDate(coverage.expiry_date) : 'No expiry'}
                                                {isExpired(coverage.expiry_date) && (
                                                    <span className="text-red-600 dark:text-red-400 ml-2">(Expired)</span>
                                                )}
                                            </p>
                                        </div>
                                        {coverage.coverage_limit && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Coverage Limit</p>
                                                <p className="font-medium">${coverage.coverage_limit.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}