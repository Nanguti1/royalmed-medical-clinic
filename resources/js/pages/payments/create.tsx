import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, User, Smartphone } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    invoice: {
        id: number;
        invoice_number: string;
        total_amount: number;
        due_amount: number;
        issued_at: string;
        status: {
            code: string;
            name: string;
        } | null;
        visit: {
            id: number;
            patient: {
                first_name: string;
                other_names: string | null;
                last_name: string;
                phone: string | null;
            };
        };
        items: Array<{
            id: number;
            description: string;
            quantity: number;
            unit_price: number;
            total_price: number;
        }>;
        payments: Array<{
            id: number;
            amount: number;
            paid_at: string;
        }>;
    };
    paymentMethods: Array<{
        id: number;
        name: string;
        provider: string | null;
    }>;
    outstandingBalance: number;
};

export default function PaymentCreate() {
    const { invoice, paymentMethods, outstandingBalance } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        invoice_id: invoice.id,
        payment_method_id: '',
        amount: outstandingBalance,
        paid_at: new Date().toISOString().split('T')[0],
        reference: '',
        mpesa: {
            transaction_id: '',
            phone: '',
            amount: outstandingBalance,
            status: 'completed',
            occurred_at: new Date().toISOString().split('T')[0],
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/payments');
    };

    const patientName = invoice.visit.patient
        ? [invoice.visit.patient.first_name, invoice.visit.patient.other_names, invoice.visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const selectedPaymentMethod = paymentMethods.find((pm) => pm.id === Number(data.payment_method_id));
    const isMpesa = selectedPaymentMethod?.name.toLowerCase() === 'mpesa';

    const getStatusBadge = (statusCode: string) => {
        switch (statusCode) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Partially Paid</Badge>;
            case 'unpaid':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Unpaid</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Cancelled</Badge>;
            default:
                return <Badge>{statusCode}</Badge>;
        }
    };

    const calculateTotalPaid = () => {
        return (invoice.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
    };

    return (
        <>
            <Head title={`Record Payment - ${invoice.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/billing/${invoice.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
                        <p className="text-muted-foreground">
                            Invoice {invoice.invoice_number} • {patientName}
                        </p>
                    </div>
                    {invoice.status && getStatusBadge(invoice.status.code)}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Invoice Summary */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <p className="font-medium">{patientName}</p>
                            </div>
                            {invoice.visit.patient.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{invoice.visit.patient.phone}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                <p className="font-medium">{invoice.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="font-medium">{Number(invoice.total_amount).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount Paid</p>
                                <p className="font-medium">{Number(calculateTotalPaid()).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                                <p className="font-medium text-lg text-primary">{Number(outstandingBalance).toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="payment_method_id" className="text-sm font-medium">
                                            Payment Method
                                        </label>
                                        <select
                                            id="payment_method_id"
                                            value={data.payment_method_id}
                                            onChange={(e) => setData('payment_method_id', e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select payment method</option>
                                            {paymentMethods.map((method) => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name.charAt(0).toUpperCase() + method.name.slice(1)}
                                                    {method.provider && ` (${method.provider})`}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.payment_method_id && (
                                            <p className="text-sm text-destructive">{errors.payment_method_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="amount" className="text-sm font-medium">
                                            Amount
                                        </label>
                                        <input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={outstandingBalance}
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        />
                                        {errors.amount && (
                                            <p className="text-sm text-destructive">{errors.amount}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Maximum: {Number(outstandingBalance).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* M-Pesa specific fields */}
                                {isMpesa && (
                                    <div className="space-y-4 border-t pt-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Smartphone className="h-5 w-5 text-primary" />
                                            <h3 className="font-medium">M-Pesa Transaction Details</h3>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label htmlFor="mpesa_transaction_id" className="text-sm font-medium">
                                                    Transaction Reference *
                                                </label>
                                                <input
                                                    id="mpesa_transaction_id"
                                                    type="text"
                                                    value={data.mpesa.transaction_id}
                                                    onChange={(e) => setData('mpesa.transaction_id', e.target.value)}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    placeholder="e.g., QGH7K9ABC1"
                                                    required
                                                />
                                                {errors['mpesa.transaction_id'] && (
                                                    <p className="text-sm text-destructive">{errors['mpesa.transaction_id']}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Enter the M-Pesa transaction ID from the SMS
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="mpesa_phone" className="text-sm font-medium">
                                                    Phone Number
                                                </label>
                                                <input
                                                    id="mpesa_phone"
                                                    type="text"
                                                    value={data.mpesa.phone}
                                                    onChange={(e) => setData('mpesa.phone', e.target.value)}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    placeholder="e.g., 0712345678"
                                                />
                                                {errors['mpesa.phone'] && (
                                                    <p className="text-sm text-destructive">{errors['mpesa.phone']}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reference field for non-M-Pesa */}
                                {!isMpesa && (
                                    <div className="space-y-2">
                                        <label htmlFor="reference" className="text-sm font-medium">
                                            Reference (Optional)
                                        </label>
                                        <input
                                            id="reference"
                                            type="text"
                                            value={data.reference}
                                            onChange={(e) => setData('reference', e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="e.g., Receipt number, check number"
                                        />
                                        {errors.reference && (
                                            <p className="text-sm text-destructive">{errors.reference}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-4 pt-4 border-t">
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/billing/${invoice.id}`}>Cancel</a>
                                    </Button>
                                    <PermissionGuard permission="billing.create" fallback={null}>
                                        <Button type="submit" disabled={processing}>
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            {processing ? 'Recording...' : 'Record Payment'}
                                        </Button>
                                    </PermissionGuard>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
