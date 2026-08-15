import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    insurers: Array<{
        id: number;
        name: string;
    }>;
    schemes: Array<{
        id: number;
        name: string;
        insurer_id: number;
    }>;
};

export default function PatientCoverageCreate() {
    const { patient, insurers, schemes } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        insurer_id: '',
        insurance_scheme_id: '',
        policy_number: '',
        policy_type: 'individual',
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        is_primary: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/insurance/patients/${patient.id}/coverage`, {
            onSuccess: () => {
                window.location.href = `/insurance/patients/${patient.id}/coverage`;
            },
        });
    };

    return (
        <>
            <Head title="Add Patient Coverage" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/insurance/patients/${patient.id}/coverage`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Add Patient Coverage</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coverage Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="insurer_id">Insurer *</Label>
                                    <Select
                                        value={data.insurer_id}
                                        onValueChange={(value) => {
                                            setData('insurer_id', value);
                                            setData('insurance_scheme_id', '');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select insurer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {insurers.map((insurer) => (
                                                <SelectItem key={insurer.id} value={insurer.id.toString()}>
                                                    {insurer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.insurer_id && <p className="text-sm text-red-500">{errors.insurer_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="insurance_scheme_id">Insurance Scheme *</Label>
                                    <Select
                                        value={data.insurance_scheme_id}
                                        onValueChange={(value) => setData('insurance_scheme_id', value)}
                                        disabled={!data.insurer_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scheme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemes
                                                .filter(scheme => !data.insurer_id || scheme.insurer_id === parseInt(data.insurer_id))
                                                .map((scheme) => (
                                                    <SelectItem key={scheme.id} value={scheme.id.toString()}>
                                                        {scheme.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.insurance_scheme_id && <p className="text-sm text-red-500">{errors.insurance_scheme_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policy_number">Policy Number *</Label>
                                    <Input
                                        id="policy_number"
                                        value={data.policy_number}
                                        onChange={(e) => setData('policy_number', e.target.value)}
                                        placeholder="e.g., POL-123456"
                                    />
                                    {errors.policy_number && <p className="text-sm text-red-500">{errors.policy_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policy_type">Policy Type *</Label>
                                    <Select
                                        value={data.policy_type}
                                        onValueChange={(value) => setData('policy_type', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="family">Family</SelectItem>
                                            <SelectItem value="corporate">Corporate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.policy_type && <p className="text-sm text-red-500">{errors.policy_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="effective_date">Effective Date *</Label>
                                    <Input
                                        id="effective_date"
                                        type="date"
                                        value={data.effective_date}
                                        onChange={(e) => setData('effective_date', e.target.value)}
                                    />
                                    {errors.effective_date && <p className="text-sm text-red-500">{errors.effective_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry_date">Expiry Date *</Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                    />
                                    {errors.expiry_date && <p className="text-sm text-red-500">{errors.expiry_date}</p>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_primary"
                                    checked={data.is_primary}
                                    onCheckedChange={(checked) => setData('is_primary', checked as boolean)}
                                />
                                <Label htmlFor="is_primary" className="cursor-pointer">Primary Insurance</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/insurance/patients/${patient.id}/coverage`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Adding...' : 'Add Coverage'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
