import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, PenTool, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    templates: Array<{
        id: number;
        name: string;
        category: string;
    }>;
};

export default function PatientConsentSign() {
    const { patient, templates } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        consent_template_id: '',
        signature_data: '',
        signature_method: 'digital',
        witness_name: '',
        witness_title: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/documents/patients/${patient.id}/consents/sign`, {
            onSuccess: () => {
                window.location.href = `/documents/patients/${patient.id}/consents`;
            },
        });
    };

    return (
        <>
            <Head title="Sign Consent" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/documents/patients/${patient.id}/consents`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sign Consent</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Consent Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="consent_template_id">Consent Template *</Label>
                                    <Select
                                        value={data.consent_template_id}
                                        onValueChange={(value) => setData('consent_template_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((template) => (
                                                <SelectItem key={template.id} value={template.id.toString()}>
                                                    {template.name} ({template.category})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.consent_template_id && <p className="text-sm text-red-500">{errors.consent_template_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signature_method">Signature Method *</Label>
                                    <Select
                                        value={data.signature_method}
                                        onValueChange={(value) => setData('signature_method', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="digital">Digital</SelectItem>
                                            <SelectItem value="written">Written</SelectItem>
                                            <SelectItem value="verbal">Verbal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.signature_method && <p className="text-sm text-red-500">{errors.signature_method}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="witness_name">Witness Name</Label>
                                    <Input
                                        id="witness_name"
                                        value={data.witness_name}
                                        onChange={(e) => setData('witness_name', e.target.value)}
                                        placeholder="Witness name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="witness_title">Witness Title</Label>
                                    <Input
                                        id="witness_title"
                                        value={data.witness_title}
                                        onChange={(e) => setData('witness_title', e.target.value)}
                                        placeholder="Witness title"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signature_data">Signature Data *</Label>
                                <Input
                                    id="signature_data"
                                    value={data.signature_data}
                                    onChange={(e) => setData('signature_data', e.target.value)}
                                    placeholder="Signature data or reference"
                                />
                                {errors.signature_data && <p className="text-sm text-red-500">{errors.signature_data}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/documents/patients/${patient.id}/consents`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <PenTool className="mr-2 h-4 w-4" />
                                    {processing ? 'Signing...' : 'Sign Consent'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
