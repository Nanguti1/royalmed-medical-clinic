import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    purchase_orders: Array<{
        id: number;
        order_number: string;
        supplier_id: number;
        supplier: {
            id: number;
            name: string;
        };
    }>;
};

export default function GRNCreate() {
    const { purchase_orders } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        purchase_order_id: '',
        grn_number: '',
        received_date: new Date().toISOString().split('T')[0],
        supplier_id: '',
        notes: '',
    });

    const handleOrderChange = (orderId: string) => {
        const order = purchase_orders.find(o => o.id.toString() === orderId);
        if (order) {
            setData('purchase_order_id', orderId);
            setData('supplier_id', order.supplier_id.toString());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pharmacy/grn', {
            onSuccess: () => {
                window.location.href = '/pharmacy/grn';
            },
        });
    };

    return (
        <>
            <Head title="Create Goods Received Note" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/grn">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Goods Received Note</h1>
                        <p className="text-muted-foreground">Record received stock from purchase orders.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>GRN Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_order_id">Purchase Order *</Label>
                                    <Select
                                        value={data.purchase_order_id}
                                        onValueChange={handleOrderChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select purchase order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {purchase_orders.map((order) => (
                                                <SelectItem key={order.id} value={order.id.toString()}>
                                                    {order.order_number} - {order.supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.purchase_order_id && <p className="text-sm text-red-500">{errors.purchase_order_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grn_number">GRN Number *</Label>
                                    <Input
                                        id="grn_number"
                                        value={data.grn_number}
                                        onChange={(e) => setData('grn_number', e.target.value)}
                                    />
                                    {errors.grn_number && <p className="text-sm text-red-500">{errors.grn_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="received_date">Received Date *</Label>
                                    <Input
                                        id="received_date"
                                        type="date"
                                        value={data.received_date}
                                        onChange={(e) => setData('received_date', e.target.value)}
                                    />
                                    {errors.received_date && <p className="text-sm text-red-500">{errors.received_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Delivery notes, condition of goods, etc."
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/pharmacy/grn">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create GRN'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
