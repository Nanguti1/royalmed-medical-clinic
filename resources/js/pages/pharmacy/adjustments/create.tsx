import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    medicines: Array<{
        id: number;
        name: string;
        generic_name: string;
    }>;
};

export default function StockAdjustmentCreate() {
    const { medicines } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        medicine_id: '',
        adjustment_type: 'addition',
        quantity: '',
        reason: '',
        reference_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pharmacy/adjustments', {
            onSuccess: () => {
                window.location.href = '/pharmacy/adjustments';
            },
        });
    };

    return (
        <>
            <Head title="Create Stock Adjustment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/adjustments">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Stock Adjustment</h1>
                        <p className="text-muted-foreground">Record inventory adjustment requiring approval.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Adjustment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="medicine_id">Medicine *</Label>
                                    <Select
                                        value={data.medicine_id}
                                        onValueChange={(value) => setData('medicine_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select medicine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {medicines.map((medicine) => (
                                                <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                                    {medicine.name} ({medicine.generic_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.medicine_id && <p className="text-sm text-red-500">{errors.medicine_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adjustment_type">Adjustment Type *</Label>
                                    <Select
                                        value={data.adjustment_type}
                                        onValueChange={(value) => setData('adjustment_type', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="addition">Addition</SelectItem>
                                            <SelectItem value="subtraction">Subtraction</SelectItem>
                                            <SelectItem value="damage">Damage</SelectItem>
                                            <SelectItem value="expiry">Expiry</SelectItem>
                                            <SelectItem value="theft">Theft</SelectItem>
                                            <SelectItem value="correction">Correction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.adjustment_type && <p className="text-sm text-red-500">{errors.adjustment_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                    />
                                    {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason *</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Explain the reason for this adjustment"
                                />
                                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/pharmacy/adjustments">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Adjustment'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
