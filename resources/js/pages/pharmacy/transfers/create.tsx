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

export default function StockTransferCreate() {
    const { medicines } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        medicine_id: '',
        from_location: '',
        to_location: '',
        quantity: '',
        transfer_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pharmacy/transfers', {
            onSuccess: () => {
                window.location.href = '/pharmacy/transfers';
            },
        });
    };

    return (
        <>
            <Head title="Create Stock Transfer" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/transfers">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Stock Transfer</h1>
                        <p className="text-muted-foreground">Transfer stock between locations.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Details</CardTitle>
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
                                    <Label htmlFor="from_location">From Location *</Label>
                                    <Input
                                        id="from_location"
                                        value={data.from_location}
                                        onChange={(e) => setData('from_location', e.target.value)}
                                        placeholder="e.g., Main Pharmacy"
                                    />
                                    {errors.from_location && <p className="text-sm text-red-500">{errors.from_location}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="to_location">To Location *</Label>
                                    <Input
                                        id="to_location"
                                        value={data.to_location}
                                        onChange={(e) => setData('to_location', e.target.value)}
                                        placeholder="e.g., Emergency Room"
                                    />
                                    {errors.to_location && <p className="text-sm text-red-500">{errors.to_location}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="transfer_date">Transfer Date *</Label>
                                    <Input
                                        id="transfer_date"
                                        type="date"
                                        value={data.transfer_date}
                                        onChange={(e) => setData('transfer_date', e.target.value)}
                                    />
                                    {errors.transfer_date && <p className="text-sm text-red-500">{errors.transfer_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number *</Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                    />
                                    {errors.reference_number && <p className="text-sm text-red-500">{errors.reference_number}</p>}
                                </div>
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
                                    <a href="/pharmacy/transfers">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Transfer'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
