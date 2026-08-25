import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
        insurance_scheme_id: '',
        requested_amount: '',
        diagnosis: '',
        proposed_treatment: '',
        service_code: '',
        urgency: 'routine',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/billing/preauthorizations', {
            onSuccess: () => {
                window.location.href = '/billing/preauthorizations';
            },
        });
    };

    return (
        <>
            <Head title="New Preauthorization" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/preauthorizations">
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
                                    <Label htmlFor="requested_amount">Requested Amount *</Label>
                                    <Input
                                        id="requested_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.requested_amount}
                                        onChange={(e) => setData('requested_amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.requested_amount && <p className="text-sm text-red-500">{errors.requested_amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="urgency">Urgency *</Label>
                                    <Select
                                        value={data.urgency}
                                        onValueChange={(value) => setData('urgency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select urgency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="routine">Routine</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.urgency && <p className="text-sm text-red-500">{errors.urgency}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_code">Service Code</Label>
                                    <Input
                                        id="service_code"
                                        value={data.service_code}
                                        onChange={(e) => setData('service_code', e.target.value)}
                                        placeholder="Optional service code"
                                    />
                                    {errors.service_code && <p className="text-sm text-red-500">{errors.service_code}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnosis *</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    placeholder="Patient diagnosis"
                                    rows={3}
                                />
                                {errors.diagnosis && <p className="text-sm text-red-500">{errors.diagnosis}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proposed_treatment">Proposed Treatment *</Label>
                                <Textarea
                                    id="proposed_treatment"
                                    value={data.proposed_treatment}
                                    onChange={(e) => setData('proposed_treatment', e.target.value)}
                                    placeholder="Detailed description of proposed treatment"
                                    rows={3}
                                />
                                {errors.proposed_treatment && <p className="text-sm text-red-500">{errors.proposed_treatment}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes"
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/billing/preauthorizations">Cancel</a>
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
