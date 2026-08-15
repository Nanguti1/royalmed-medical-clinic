import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Shield } from 'lucide-react';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
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

export default function CreatePatientCoverage() {
    const { patient, insurers, schemes } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        insurer_id: 0,
        scheme_id: 0,
        policy_number: '',
        policy_holder_name: '',
        policy_holder_relationship: '',
        effective_date: '',
        expiry_date: '',
        coverage_limit: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/patients/${patient.id}/coverage`);
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const filteredSchemes = data.insurer_id
        ? schemes.filter(scheme => scheme.insurer_id === data.insurer_id)
        : [];

    return (
        <>
            <Head title="Add Insurance Coverage" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Add Insurance Coverage</h2>
                        <p className="text-muted-foreground">
                            Add insurance coverage for {patient.first_name} {patient.last_name}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Coverage Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AlertError errors={errors} />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="insurer_id">Insurer *</Label>
                                    <select
                                        id="insurer_id"
                                        value={data.insurer_id}
                                        onChange={(e) => {
                                            setData('insurer_id', parseInt(e.target.value));
                                            setData('scheme_id', 0);
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    >
                                        <option value={0}>Select insurer</option>
                                        {insurers.map((insurer) => (
                                            <option key={insurer.id} value={insurer.id}>
                                                {insurer.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.insurer_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheme_id">Insurance Scheme *</Label>
                                    <select
                                        id="scheme_id"
                                        value={data.scheme_id}
                                        onChange={(e) => setData('scheme_id', parseInt(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                        disabled={!data.insurer_id}
                                    >
                                        <option value={0}>Select scheme</option>
                                        {filteredSchemes.map((scheme) => (
                                            <option key={scheme.id} value={scheme.id}>
                                                {scheme.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.scheme_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policy_number">Policy Number *</Label>
                                    <Input
                                        id="policy_number"
                                        value={data.policy_number}
                                        onChange={(e) => setData('policy_number', e.target.value)}
                                        placeholder="Enter policy number"
                                        required
                                    />
                                    <InputError message={errors.policy_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policy_holder_name">Policy Holder Name *</Label>
                                    <Input
                                        id="policy_holder_name"
                                        value={data.policy_holder_name}
                                        onChange={(e) => setData('policy_holder_name', e.target.value)}
                                        placeholder="Name of policy holder"
                                        required
                                    />
                                    <InputError message={errors.policy_holder_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policy_holder_relationship">Relationship to Patient *</Label>
                                    <select
                                        id="policy_holder_relationship"
                                        value={data.policy_holder_relationship}
                                        onChange={(e) => setData('policy_holder_relationship', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="self">Self</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="parent">Parent</option>
                                        <option value="child">Child</option>
                                        <option value="sibling">Sibling</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <InputError message={errors.policy_holder_relationship} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="effective_date">Effective Date *</Label>
                                    <Input
                                        id="effective_date"
                                        type="date"
                                        value={data.effective_date}
                                        onChange={(e) => setData('effective_date', e.target.value)}
                                        max={getTodayDate()}
                                        required
                                    />
                                    <InputError message={errors.effective_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry_date">Expiry Date</Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                        min={data.effective_date || getTodayDate()}
                                    />
                                    <InputError message={errors.expiry_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="coverage_limit">Coverage Limit</Label>
                                    <Input
                                        id="coverage_limit"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.coverage_limit}
                                        onChange={(e) => setData('coverage_limit', e.target.value)}
                                        placeholder="Maximum coverage amount"
                                    />
                                    <InputError message={errors.coverage_limit} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/patients/${patient.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
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