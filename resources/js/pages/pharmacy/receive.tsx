import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Pill } from 'lucide-react';
import type { Medicine } from '@/types/visit';

type PageProps = {
    medicines: Medicine[];
    has_medicines: boolean;
};

export default function PharmacyReceive() {
    const { medicines, has_medicines } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        medicine_id: 0,
        batch_number: '',
        quantity: 1,
        expiry_date: '',
        purchase_price: '',
        supplier_id: '',
        received_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pharmacy/receive');
    };

    return (
        <>
            <Head title="Receive Stock" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/inventory">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Receive Stock</h1>
                        <p className="text-muted-foreground">
                            Add new stock batch to inventory
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Stock Receipt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!has_medicines ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No medicines in catalog</h3>
                                <p className="text-muted-foreground mb-4">
                                    You need to add medicines to the catalog before receiving stock.
                                    In a typical clinical workflow, this would be managed by pharmacy administrators
                                    or procurement teams who maintain the drug formulary.
                                </p>
                                <Button asChild>
                                    <a href="/pharmacy/inventory">View Inventory</a>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="medicine_id">Medicine *</Label>
                                        <select
                                            id="medicine_id"
                                            value={data.medicine_id}
                                            onChange={(e) => setData('medicine_id', parseInt(e.target.value))}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value={0}>Select medicine</option>
                                            {medicines.map((med) => (
                                                <option key={med.id} value={med.id}>
                                                    {med.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.medicine_id} />
                                    </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_number">Batch Number *</Label>
                                    <input
                                        id="batch_number"
                                        type="text"
                                        value={data.batch_number}
                                        onChange={(e) => setData('batch_number', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., BATCH-2024-001"
                                    />
                                    <InputError message={errors.batch_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <InputError message={errors.quantity} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry_date">Expiry Date *</Label>
                                    <input
                                        id="expiry_date"
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <InputError message={errors.expiry_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purchase_price">Purchase Price</Label>
                                    <input
                                        id="purchase_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', e.target.value ? parseFloat(e.target.value) : '')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.purchase_price} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="received_at">Received Date</Label>
                                    <input
                                        id="received_at"
                                        type="date"
                                        value={data.received_at}
                                        onChange={(e) => setData('received_at', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <InputError message={errors.received_at} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/pharmacy/inventory">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Receiving...' : 'Receive Stock'}
                                </Button>
                            </div>
                        </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
