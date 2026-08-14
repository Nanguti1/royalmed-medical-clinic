import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, User } from 'lucide-react';

type Patient = {
    id: number;
    hospital_number?: string;
    first_name: string;
    last_name: string;
    other_names?: string;
    gender_id?: number;
    date_of_birth?: string;
};

type LabTest = {
    id: number;
    name: string;
    code?: string;
};

type LabResult = {
    id: number;
    result_value: string;
    units?: string;
    reference_range?: string;
    notes?: string;
    is_abnormal: boolean;
    is_critical: boolean;
    verification_status: string;
    recorded_at: string;
    test?: LabTest;
    recorded_by?: { name: string };
    verified_by?: { name: string };
    order_item?: {
        order?: {
            id: number;
            accession_number?: string;
            visit?: { id: number; visit_date: string };
        };
    };
};

type Pagination<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

export default function PatientLabHistory({
    patient,
    history,
}: {
    patient: Patient;
    history: Pagination<LabResult>;
}) {
    const patientName = [patient.first_name, patient.other_names, patient.last_name].filter(Boolean).join(' ');

    return (
        <>
            <Head title={`Lab History - ${patientName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Laboratory History</h1>
                        <p className="text-muted-foreground">
                            {patientName} • Hospital #{patient.hospital_number || patient.id}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Chronological Laboratory Results ({history.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.data.length > 0 ? (
                            <div className="space-y-4">
                                {history.data.map((result) => (
                                    <div key={result.id} className="rounded-lg border p-4 shadow-sm hover:border-primary transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{result.test?.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Recorded: {new Date(result.recorded_at).toLocaleString()} • Order #{result.order_item?.order?.id} ({result.order_item?.order?.accession_number || 'N/A'})
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {result.is_critical && <Badge className="bg-red-600 text-white">Critical</Badge>}
                                                {result.is_abnormal && !result.is_critical && <Badge className="bg-orange-100 text-orange-800">Abnormal</Badge>}
                                                <Badge variant="outline" className="capitalize">{result.verification_status}</Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3 bg-muted/40 p-3 rounded-md">
                                            <div>
                                                <span className="text-muted-foreground text-xs block">Result Value</span>
                                                <span className={`font-semibold ${result.is_critical ? 'text-red-600' : result.is_abnormal ? 'text-orange-600' : ''}`}>
                                                    {result.result_value} {result.units}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground text-xs block">Reference Range</span>
                                                <span>{result.reference_range || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground text-xs block">Recorded By</span>
                                                <span>{result.recorded_by?.name || 'Staff'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground text-xs block">Verified By</span>
                                                <span>{result.verified_by?.name || 'Pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-muted-foreground">No laboratory result history recorded for this patient.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
