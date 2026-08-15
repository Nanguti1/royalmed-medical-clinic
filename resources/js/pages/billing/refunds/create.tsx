import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    invoices: Array<{
        id: number;
        invoice_number: string;
        total_amount: number;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
        };
    }>;
};

export default function RefundCreate() {
    const { invoices } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        amount: '',
        reason: '',
        refund_method: 'bank_transfer',
    });

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find(i => i.id.toString() === invoiceId);
        if (invoice) {
            setData('invoice_id', invoiceId);
            setData('amount', invoice.total_amount.toString());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/billing/refunds', {
            onSuccess: () => {
                window.location.href = '/billing/refunds';
            },
        });
    };

    return (
        <>
            <Head title="Create Refund" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/refunds">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Refund</h1>
                        <p className="text-muted-foreground">Process a refund for an invoice.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Refund Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="invoice_id">Invoice *</Label>
                                    <Select
                                        value={data.invoice_id}
                                        onValueChange={handleInvoiceChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select invoice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {invoices.map((invoice) => (
                                                <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                                    {invoice.invoice_number} - {invoice.patient.first_name} {invoice.patient.last_name} (${invoice.total_amount})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.invoice_id && <p className="text-sm text-red-500">{errors.invoice_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                    />
                                    {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="refund_method">Refund Method *</Label>
                                    <Select
                                        value={data.refund_method}
                                        onValueChange={(value) => setData('refund_method', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.refund_method && <p className="text-sm text-red-500">{errors.refund_method}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason *</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Explain the reason for this refund"
                                />
                                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/billing/refunds">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Refund'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
