import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageProps = {
    record: {
        id: number;
        record_number: string;
        administration_date: string;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            hospital_number: string;
        };
        vaccine: {
            id: number;
            name: string;
        };
    };
};

export default function CertificateGenerate() {
    const { record } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        issuing_authority: '',
        issuer_name: '',
        issuer_license: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/vaccinations/${record.id}/certificates/generate`, {
            onSuccess: () => {
                window.location.href = '/vaccinations/certificates';
            },
        });
    };

    return (
        <>
            <Head title="Generate Certificate" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/vaccinations/${record.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Generate Certificate</h1>
                        <p className="text-muted-foreground">
                            {record.record_number} - {record.patient.first_name} {record.patient.last_name}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vaccination Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Patient:</span> {record.patient.first_name} {record.patient.last_name} ({record.patient.hospital_number})</p>
                            <p><span className="font-medium">Vaccine:</span> {record.vaccine.name}</p>
                            <p><span className="font-medium">Date:</span> {new Date(record.administration_date).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Certificate Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="valid_from">Valid From *</Label>
                                    <Input
                                        id="valid_from"
                                        type="date"
                                        value={data.valid_from}
                                        onChange={(e) => setData('valid_from', e.target.value)}
                                    />
                                    {errors.valid_from && <p className="text-sm text-red-500">{errors.valid_from}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="valid_until">Valid Until</Label>
                                    <Input
                                        id="valid_until"
                                        type="date"
                                        value={data.valid_until}
                                        onChange={(e) => setData('valid_until', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="issuing_authority">Issuing Authority *</Label>
                                    <Input
                                        id="issuing_authority"
                                        value={data.issuing_authority}
                                        onChange={(e) => setData('issuing_authority', e.target.value)}
                                        placeholder="e.g., Ministry of Health"
                                    />
                                    {errors.issuing_authority && <p className="text-sm text-red-500">{errors.issuing_authority}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="issuer_name">Issuer Name *</Label>
                                    <Input
                                        id="issuer_name"
                                        value={data.issuer_name}
                                        onChange={(e) => setData('issuer_name', e.target.value)}
                                        placeholder="e.g., Dr. John Doe"
                                    />
                                    {errors.issuer_name && <p className="text-sm text-red-500">{errors.issuer_name}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="issuer_license">Issuer License</Label>
                                    <Input
                                        id="issuer_license"
                                        value={data.issuer_license}
                                        onChange={(e) => setData('issuer_license', e.target.value)}
                                        placeholder="License number"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/vaccinations/${record.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    {processing ? 'Generating...' : 'Generate Certificate'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
