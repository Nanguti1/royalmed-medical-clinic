import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, Download, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PageProps = {
    certificate: {
        id: number;
        certificate_number: string;
        valid_from: string;
        valid_until: string | null;
        issuing_authority: string;
        issuer_name: string;
        issuer_license: string | null;
        qr_code: string | null;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            hospital_number: string;
            date_of_birth: string;
        };
        vaccinationRecord: {
            id: number;
            administration_date: string;
            vaccine: {
                name: string;
                code: string;
            };
        };
        createdBy: {
            id: number;
            name: string;
        };
    };
};

export default function CertificatePrint() {
    const { certificate } = usePage<PageProps>().props;

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Certificate ${certificate.certificate_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/vaccinations/certificates">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Vaccination Certificate</h1>
                        <p className="text-muted-foreground">{certificate.certificate_number}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/vaccinations/${certificate.vaccinationRecord.id}`}>
                                View Record
                            </a>
                        </Button>
                    </div>
                </div>

                <Card className="border-2">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Vaccination Certificate</CardTitle>
                        <p className="text-muted-foreground">Official Health Record</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Certificate Number</p>
                                <p className="font-medium">{certificate.certificate_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Issuing Authority</p>
                                <p className="font-medium">{certificate.issuing_authority}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-4">Patient Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">
                                        {certificate.patient.first_name} {certificate.patient.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Hospital Number</p>
                                    <p className="font-medium">{certificate.patient.hospital_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(certificate.patient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-4">Vaccination Details</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vaccine</p>
                                    <p className="font-medium">{certificate.vaccinationRecord.vaccine.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Vaccine Code</p>
                                    <p className="font-medium">{certificate.vaccinationRecord.vaccine.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Administration Date</p>
                                    <p className="font-medium">{new Date(certificate.vaccinationRecord.administration_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-4">Validity</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Valid From</p>
                                    <p className="font-medium">{new Date(certificate.valid_from).toLocaleDateString()}</p>
                                </div>
                                {certificate.valid_until && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Valid Until</p>
                                        <p className="font-medium">{new Date(certificate.valid_until).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-4">Issuer Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Issuer Name</p>
                                    <p className="font-medium">{certificate.issuer_name}</p>
                                </div>
                                {certificate.issuer_license && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">License Number</p>
                                        <p className="font-medium">{certificate.issuer_license}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {certificate.qr_code && (
                            <div className="border-t pt-4 flex justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                                        <FileText className="h-16 w-16 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                            <p>Issued on {new Date(certificate.created_at).toLocaleDateString()}</p>
                            {certificate.createdBy && <p>Issued by {certificate.createdBy.name}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
