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

export default function PaymentPlanCreate() {
    const { invoices } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        total_amount: '',
        installment_count: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
    });

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find(i => i.id.toString() === invoiceId);
        if (invoice) {
            setData('invoice_id', invoiceId);
            setData('total_amount', invoice.total_amount.toString());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/billing/payment-plans', {
            onSuccess: () => {
                window.location.href = '/billing/payment-plans';
            },
        });
    };

    return (
        <>
            <Head title="Create Payment Plan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/payment-plans">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Payment Plan</h1>
                        <p className="text-muted-foreground">Set up an installment payment plan for a patient.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Plan Details</CardTitle>
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

                                <div className="space-y-2">
                                    <Label htmlFor="installment_count">Number of Installments *</Label>
                                    <Input
                                        id="installment_count"
                                        type="number"
                                        min="2"
                                        value={data.installment_count}
                                        onChange={(e) => setData('installment_count', e.target.value)}
                                    />
                                    {errors.installment_count && <p className="text-sm text-red-500">{errors.installment_count}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frequency">Frequency *</Label>
                                    <Select
                                        value={data.frequency}
                                        onValueChange={(value) => setData('frequency', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.frequency && <p className="text-sm text-red-500">{errors.frequency}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/billing/payment-plans">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Payment Plan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
