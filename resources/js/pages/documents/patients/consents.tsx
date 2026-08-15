import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, AlertTriangle, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { PatientConsent } from '@/types/document';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    consents: PatientConsent[];
};

export default function PatientConsents() {
    const { patient, consents } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'signed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'revoked':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={`Patient Consents - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Patient Consents</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                    <Button asChild>
                        <a href={`/documents/patients/${patient.id}/consents/sign`}>
                            <PenTool className="mr-2 h-4 w-4" />
                            Sign Consent
                        </a>
                    </Button>
                </div>

                {consents.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No consents found"
                        description="This patient has no signed consents."
                    />
                ) : (
                    <div className="grid gap-4">
                        {consents.map((consent) => (
                            <ConsentCard key={consent.id} consent={consent} getStatusColor={getStatusColor} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function ConsentCard({ consent, getStatusColor }: { consent: PatientConsent; getStatusColor: (status: string) => string }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {consent.template?.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{consent.template?.category}</p>
                    </div>
                    <Badge className={getStatusColor(consent.status)}>
                        {consent.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Signed: {consent.signed_at ? new Date(consent.signed_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p className="text-muted-foreground">Method: {consent.signature_method}</p>
                    {consent.expires_at && (
                        <p className="text-muted-foreground">Expires: {new Date(consent.expires_at).toLocaleDateString()}</p>
                    )}
                    {consent.witness_name && (
                        <p className="text-muted-foreground">Witness: {consent.witness_name} ({consent.witness_title})</p>
                    )}
                    {consent.signedBy && (
                        <p className="text-muted-foreground">Signed by: {consent.signedBy.name}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
