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

export default function CreditNoteCreate() {
    const { invoices } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        amount: '',
        reason: '',
        expiry_date: '',
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
        post('/billing/credit-notes', {
            onSuccess: () => {
                window.location.href = '/billing/credit-notes';
            },
        });
    };

    return (
        <>
            <Head title="Create Credit Note" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/credit-notes">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Credit Note</h1>
                        <p className="text-muted-foreground">Issue a credit note for future payments.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Credit Note Details</CardTitle>
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
                                    <Label htmlFor="expiry_date">Expiry Date</Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                    />
                                    {errors.expiry_date && <p className="text-sm text-red-500">{errors.expiry_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason *</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Explain the reason for this credit note"
                                />
                                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/billing/credit-notes">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Credit Note'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
