import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type PageProps = {
    insurers: Array<{
        id: number;
        name: string;
    }>;
};

export default function InsuranceSchemeCreate() {
    const { insurers } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        insurer_id: '',
        name: '',
        code: '',
        description: '',
        coverage_type: '',
        coverage_limits: '',
        copayment_percentage: '',
        annual_limit: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/insurance/schemes', {
            onSuccess: () => {
                window.location.href = '/insurance/schemes';
            },
        });
    };

    return (
        <>
            <Head title="New Insurance Scheme" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/insurance/schemes">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Insurance Scheme</h1>
                        <p className="text-muted-foreground">Create a new insurance scheme.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Scheme Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="insurer_id">Insurer *</Label>
                                    <Select
                                        value={data.insurer_id}
                                        onValueChange={(value) => setData('insurer_id', value)}
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
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Code *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                    />
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="coverage_type">Coverage Type</Label>
                                    <Input
                                        id="coverage_type"
                                        value={data.coverage_type}
                                        onChange={(e) => setData('coverage_type', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="copayment_percentage">Copayment Percentage</Label>
                                    <Input
                                        id="copayment_percentage"
                                        type="number"
                                        step="0.01"
                                        value={data.copayment_percentage}
                                        onChange={(e) => setData('copayment_percentage', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="annual_limit">Annual Limit</Label>
                                    <Input
                                        id="annual_limit"
                                        type="number"
                                        step="0.01"
                                        value={data.annual_limit}
                                        onChange={(e) => setData('annual_limit', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coverage_limits">Coverage Limits</Label>
                                <Input
                                    id="coverage_limits"
                                    value={data.coverage_limits}
                                    onChange={(e) => setData('coverage_limits', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/insurance/schemes">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Scheme'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
