import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { VaccinationRecord } from '@/types/vaccination';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    history: VaccinationRecord[];
    due: Array<{
        vaccine: string;
        recommended_age: string;
        due_date: string;
    }>;
    overdue: Array<{
        vaccine: string;
        recommended_age: string;
        due_date: string;
    }>;
};

export default function PatientVaccinations() {
    const { patient, history, due, overdue } = usePage<PageProps>().props;

    return (
        <>
            <Head title={`Patient Vaccinations - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Patient Vaccinations</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/vaccinations/create">
                            <Calendar className="mr-2 h-4 w-4" />
                            Record Vaccination
                        </a>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Overdue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {overdue.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No overdue vaccinations.</p>
                            ) : (
                                <div className="space-y-2">
                                    {overdue.map((item, index) => (
                                        <div key={index} className="p-3 border border-red-200 bg-red-50 rounded">
                                            <p className="font-medium">{item.vaccine}</p>
                                            <p className="text-sm text-muted-foreground">Recommended: {item.recommended_age}</p>
                                            <p className="text-sm text-red-600">Due: {new Date(item.due_date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                Due Soon
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {due.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming vaccinations.</p>
                            ) : (
                                <div className="space-y-2">
                                    {due.map((item, index) => (
                                        <div key={index} className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                                            <p className="font-medium">{item.vaccine}</p>
                                            <p className="text-sm text-muted-foreground">Recommended: {item.recommended_age}</p>
                                            <p className="text-sm text-muted-foreground">Due: {new Date(item.due_date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Vaccination History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                title="No vaccination history"
                                description="This patient has no recorded vaccinations."
                            />
                        ) : (
                            <div className="space-y-4">
                                {history.map((record) => (
                                    <div key={record.id} className="p-4 border rounded">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium">{record.vaccine?.name}</h3>
                                                <p className="text-sm text-muted-foreground">{record.record_number}</p>
                                            </div>
                                            <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                                                {record.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-muted-foreground">Date: {new Date(record.administration_date).toLocaleDateString()}</p>
                                            <p className="text-muted-foreground">Dose: {record.dose_number}</p>
                                            <p className="text-muted-foreground">Site: {record.site.replace('_', ' ')}</p>
                                            <p className="text-muted-foreground">Route: {record.route}</p>
                                            {record.batch_number && (
                                                <p className="text-muted-foreground">Batch: {record.batch_number}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
