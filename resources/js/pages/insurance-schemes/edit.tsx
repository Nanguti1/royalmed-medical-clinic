import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type PageProps = {
    scheme: {
        id: number;
        insurer_id: number;
        name: string;
        code: string;
        description: string | null;
        coverage_type: string | null;
        max_benefit_amount: number | null;
        co_payment_percentage: number | null;
        is_active: boolean;
    };
    insurers: Array<{
        id: number;
        name: string;
    }>;
};

export default function InsuranceSchemeEdit() {
    const { scheme, insurers } = usePage<PageProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        insurer_id: scheme.insurer_id,
        name: scheme.name,
        code: scheme.code,
        description: scheme.description || '',
        coverage_type: scheme.coverage_type || 'individual',
        max_benefit_amount: scheme.max_benefit_amount || '',
        co_payment_percentage: scheme.co_payment_percentage || '',
        is_active: scheme.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/insurance/schemes/${scheme.id}`);
    };

    return (
        <>
            <Head title="Edit Insurance Scheme" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/insurance/schemes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Insurance Scheme</h1>
                        <p className="text-muted-foreground">Update scheme details.</p>
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
                                        value={data.insurer_id?.toString()}
                                        onValueChange={(value) => setData('insurer_id', value ? parseInt(value) : null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
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
                                    <Label htmlFor="coverage_type">Coverage Type *</Label>
                                    <Select
                                        value={data.coverage_type}
                                        onValueChange={(value) => setData('coverage_type', value)}
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
                                    {errors.coverage_type && <p className="text-sm text-red-500">{errors.coverage_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="co_payment_percentage">Co-payment Percentage</Label>
                                    <Input
                                        id="co_payment_percentage"
                                        type="number"
                                        step="0.01"
                                        value={data.co_payment_percentage}
                                        onChange={(e) => setData('co_payment_percentage', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_benefit_amount">Max Benefit Amount</Label>
                                    <Input
                                        id="max_benefit_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.max_benefit_amount}
                                        onChange={(e) => setData('max_benefit_amount', e.target.value)}
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
                                    <Link href="/insurance/schemes">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
