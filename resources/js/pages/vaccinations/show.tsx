import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { VaccinationRecord } from '@/types/vaccination';

type PageProps = {
    record: VaccinationRecord;
};

export default function VaccinationShow() {
    const { record } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'administered':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'skipped':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={`Vaccination ${record.record_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/vaccinations">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Vaccination Details</h1>
                        <p className="text-muted-foreground">{record.record_number}</p>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium">Name</p>
                                <p className="text-muted-foreground">
                                    {record.patient?.first_name} {record.patient?.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Hospital Number</p>
                                <p className="text-muted-foreground">{record.patient?.hospital_number}</p>
                            </div>
                            {record.patient?.date_of_birth && (
                                <div>
                                    <p className="font-medium">Date of Birth</p>
                                    <p className="text-muted-foreground">{new Date(record.patient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            )}
                            <Button variant="outline" size="sm" asChild className="mt-2">
                                <a href={`/patients/${record.patient_id}`}>
                                    View Patient Profile
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Vaccination Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Date:</span>
                                <span>{new Date(record.administration_date).toLocaleDateString()}</span>
                            </div>
                            {record.vaccine && (
                                <div>
                                    <p className="font-medium">Vaccine:</p>
                                    <p className="text-muted-foreground">{record.vaccine.name} ({record.vaccine.code})</p>
                                </div>
                            )}
                            <div>
                                <p className="font-medium">Dose Number:</p>
                                <p className="text-muted-foreground">{record.dose_number}</p>
                            </div>
                            <div>
                                <p className="font-medium">Site:</p>
                                <p className="text-muted-foreground">{record.site.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="font-medium">Route:</p>
                                <p className="text-muted-foreground">{record.route}</p>
                            </div>
                            {record.dosage && (
                                <div>
                                    <p className="font-medium">Dosage:</p>
                                    <p className="text-muted-foreground">{record.dosage} {record.dosage_unit}</p>
                                </div>
                            )}
                            {record.batch_number && (
                                <div>
                                    <p className="font-medium">Batch Number:</p>
                                    <p className="text-muted-foreground">{record.batch_number}</p>
                                </div>
                            )}
                            {record.expiry_date && (
                                <div>
                                    <p className="font-medium">Expiry Date:</p>
                                    <p className="text-muted-foreground">{new Date(record.expiry_date).toLocaleDateString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {record.reactions && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Adverse Reactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600">{record.reactions}</p>
                        </CardContent>
                    </Card>
                )}

                {record.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{record.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {record.administeredBy && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Administered By</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{record.administeredBy.name}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <a href={`/vaccinations/${record.id}/certificates/generate`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Certificate
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href={`/patients/${record.patient_id}/vaccinations`}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Patient History
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
