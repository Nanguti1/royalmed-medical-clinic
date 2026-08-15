import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, CreditCard, DollarSign, Lock } from 'lucide-react';
import type { PaymentFormData, PortalInvoice } from '@/types/portal';

type PageProps = {
    invoice: PortalInvoice;
    paymentMethods: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
};

export default function PatientPayments() {
    const { invoice, paymentMethods } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm<PaymentFormData>({
        invoice_id: invoice.id,
        amount: invoice.due_amount,
        payment_method: 'card',
        transaction_id: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portal/patient/payments');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'card':
                return <CreditCard className="h-5 w-5" />;
            case 'cash':
                return <DollarSign className="h-5 w-5" />;
            case 'bank_transfer':
                return <Lock className="h-5 w-5" />;
            default:
                return <CreditCard className="h-5 w-5" />;
        }
    };

    return (
        <>
            <Head title="Make Payment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/portal/patient/billing">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Make Payment</h1>
                        <p className="text-muted-foreground">
                            Pay invoice #{invoice.invoice_number}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Invoice Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                <p className="font-medium">{invoice.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Issue Date</p>
                                <p className="font-medium">{formatDate(invoice.issued_date)}</p>
                            </div>
                            {invoice.due_date && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Due Date</p>
                                    <p className="font-medium">{formatDate(invoice.due_date)}</p>
                                </div>
                            )}
                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Total Amount</span>
                                    <span className="font-medium">${invoice.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Already Paid</span>
                                    <span className="font-medium text-green-600">${invoice.paid_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="font-medium">Amount Due</span>
                                    <span className="font-bold text-lg">${invoice.due_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount to Pay *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={invoice.due_amount}
                                            value={data.amount}
                                            onChange={(e) => setData('amount', parseFloat(e.target.value))}
                                            required
                                        />
                                        <InputError message={errors.amount} />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum: ${invoice.due_amount.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Payment Method *</Label>
                                        <select
                                            id="payment_method"
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value as any)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            required
                                        >
                                            {paymentMethods.map((method) => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.payment_method} />
                                    </div>
                                </div>

                                {data.payment_method === 'card' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="card_number">Card Number *</Label>
                                            <Input
                                                id="card_number"
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                            />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">Expiry Date *</Label>
                                                <Input
                                                    id="expiry"
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvv">CVV *</Label>
                                                <Input
                                                    id="cvv"
                                                    type="text"
                                                    placeholder="123"
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cardholder_name">Cardholder Name *</Label>
                                            <Input
                                                id="cardholder_name"
                                                type="text"
                                                placeholder="Name on card"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="transaction_id">Transaction ID</Label>
                                    <Input
                                        id="transaction_id"
                                        value={data.transaction_id}
                                        onChange={(e) => setData('transaction_id', e.target.value)}
                                        placeholder="Optional: Reference number from your bank"
                                    />
                                    <InputError message={errors.transaction_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Any additional notes about this payment..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href="/portal/patient/billing">Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Lock className="mr-2 h-4 w-4" />
                                        {processing ? 'Processing...' : `Pay $${data.amount.toFixed(2)}`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
