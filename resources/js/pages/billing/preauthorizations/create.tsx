import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    patients: Array<{
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    }>;
    schemes: Array<{
        id: number;
        name: string;
        insurer: {
            id: number;
            name: string;
        };
    }>;
};

export default function PreauthorizationCreate() {
    const { patients, schemes } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        insurer_id: '',
        insurance_scheme_id: '',
        service_type: '',
        service_description: '',
        estimated_cost: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/insurance/preauthorizations', {
            onSuccess: () => {
                window.location.href = '/insurance/preauthorizations';
            },
        });
    };

    return (
        <>
            <Head title="New Preauthorization" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/insurance/preauthorizations">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Preauthorization</h1>
                        <p className="text-muted-foreground">Request treatment preauthorization.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Preauthorization Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <Select
                                        value={data.patient_id}
                                        onValueChange={(value) => {
                                            setData('patient_id', value);
                                            const patient = patients.find(p => p.id === parseInt(value));
                                            if (patient) {
                                                setData('insurance_scheme_id', '');
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                                    {patient.first_name} {patient.last_name} ({patient.hospital_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="insurance_scheme_id">Insurance Scheme *</Label>
                                    <Select
                                        value={data.insurance_scheme_id}
                                        onValueChange={(value) => {
                                            setData('insurance_scheme_id', value);
                                            const scheme = schemes.find(s => s.id === parseInt(value));
                                            if (scheme) {
                                                setData('insurer_id', scheme.insurer.id.toString());
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scheme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemes.map((scheme) => (
                                                <SelectItem key={scheme.id} value={scheme.id.toString()}>
                                                    {scheme.name} ({scheme.insurer.name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.insurance_scheme_id && <p className="text-sm text-red-500">{errors.insurance_scheme_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_type">Service Type *</Label>
                                    <Input
                                        id="service_type"
                                        value={data.service_type}
                                        onChange={(e) => setData('service_type', e.target.value)}
                                        placeholder="e.g., Surgery, Consultation"
                                    />
                                    {errors.service_type && <p className="text-sm text-red-500">{errors.service_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_cost">Estimated Cost *</Label>
                                    <Input
                                        id="estimated_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.estimated_cost}
                                        onChange={(e) => setData('estimated_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.estimated_cost && <p className="text-sm text-red-500">{errors.estimated_cost}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="service_description">Service Description *</Label>
                                <Input
                                    id="service_description"
                                    value={data.service_description}
                                    onChange={(e) => setData('service_description', e.target.value)}
                                    placeholder="Detailed description of the service"
                                />
                                {errors.service_description && <p className="text-sm text-red-500">{errors.service_description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/insurance/preauthorizations">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Preauthorization'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
