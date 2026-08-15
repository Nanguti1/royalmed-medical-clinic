import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    suppliers: Array<{
        id: number;
        name: string;
        contact_person: string;
        phone: string;
    }>;
    medicines: Array<{
        id: number;
        name: string;
        generic_name: string;
    }>;
};

export default function PurchaseOrderCreate() {
    const { suppliers, medicines } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        order_number: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        total_amount: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pharmacy/purchase-orders', {
            onSuccess: () => {
                window.location.href = '/pharmacy/purchase-orders';
            },
        });
    };

    return (
        <>
            <Head title="Create Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/purchase-orders">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
                        <p className="text-muted-foreground">Create a new purchase order for medicines.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_id">Supplier *</Label>
                                    <Select
                                        value={data.supplier_id}
                                        onValueChange={(value) => setData('supplier_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                    {supplier.name} ({supplier.contact_person})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order_number">Order Number *</Label>
                                    <Input
                                        id="order_number"
                                        value={data.order_number}
                                        onChange={(e) => setData('order_number', e.target.value)}
                                    />
                                    {errors.order_number && <p className="text-sm text-red-500">{errors.order_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order_date">Order Date *</Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={data.order_date}
                                        onChange={(e) => setData('order_date', e.target.value)}
                                    />
                                    {errors.order_date && <p className="text-sm text-red-500">{errors.order_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expected_delivery_date">Expected Delivery Date *</Label>
                                    <Input
                                        id="expected_delivery_date"
                                        type="date"
                                        value={data.expected_delivery_date}
                                        onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                    />
                                    {errors.expected_delivery_date && <p className="text-sm text-red-500">{errors.expected_delivery_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_amount">Total Amount *</Label>
                                    <Input
                                        id="total_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.total_amount}
                                        onChange={(e) => setData('total_amount', e.target.value)}
                                    />
                                    {errors.total_amount && <p className="text-sm text-red-500">{errors.total_amount}</p>}
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
                                    <a href="/pharmacy/purchase-orders">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Order'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
