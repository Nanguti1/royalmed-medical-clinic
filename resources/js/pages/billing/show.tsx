import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, DollarSign, Smartphone, UserCircle, Receipt } from 'lucide-react';
import type { Invoice } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    invoice: Invoice;
};

export default function BillingShow() {
    const { invoice } = usePage<PageProps>().props;

    const patientName = invoice.visit?.patient
        ? [invoice.visit.patient.first_name, invoice.visit.patient.other_names, invoice.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

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

    const calculateSubtotal = () => {
        return (invoice.items || []).reduce((sum, item) => sum + item.total_price, 0);
    };

    const calculateTax = () => {
        return (invoice.items || []).reduce((sum, item) => sum + (item.tax || 0), 0);
    };

    return (
        <>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/billing">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h1>
                            <p className="text-muted-foreground">
                                {patientName} • Visit #{invoice.visit_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {invoice.status && getStatusBadge(invoice.status.code)}
                        {invoice.status && invoice.status.code !== 'paid' && invoice.status.code !== 'cancelled' && (
                            <PermissionGuard permission="billing.create" fallback={null}>
                                <Button asChild>
                                    <a href={`/payments/create/${invoice.id}`}>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Record Payment
                                    </a>
                                </Button>
                            </PermissionGuard>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Patient & Invoice Info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Invoice Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <p className="font-medium">{patientName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visit ID</p>
                                <p className="font-medium">#{invoice.visit_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Date</p>
                                <p className="font-medium">{new Date(invoice.issued_at || invoice.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                {invoice.status && getStatusBadge(invoice.status.code)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoice.items && invoice.items.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Description</th>
                                                    <th className="text-right p-3">Qty</th>
                                                    <th className="text-right p-3">Unit Price</th>
                                                    <th className="text-right p-3">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.items.map((item) => (
                                                    <tr key={item.id} className="border-b">
                                                        <td className="p-3">{item.description}</td>
                                                        <td className="p-3 text-right">{item.quantity}</td>
                                                        <td className="p-3 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                                        <td className="p-3 text-right">{Number(item.total_price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="space-y-2 pt-4 border-t">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">{Number(calculateSubtotal()).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span className="font-medium">{Number(calculateTax()).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>{Number(invoice.total_amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-primary">
                                            <span>Due Amount</span>
                                            <span>{Number(invoice.due_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">No invoice items.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Total</p>
                                <p className="font-bold text-lg">KES {Number(invoice.total_amount).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount Paid</p>
                                <p className="font-bold text-lg">
                                    KES {Number(invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Outstanding</p>
                                <p className={`font-bold text-lg ${invoice.due_amount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    KES {Number(invoice.due_amount).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                {invoice.status && getStatusBadge(invoice.status.code)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Date</th>
                                            <th className="text-right p-3">Amount</th>
                                            <th className="text-left p-3">Method</th>
                                            <th className="text-left p-3">Reference</th>
                                            <th className="text-left p-3">Received By</th>
                                            <th className="text-left p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.payments.map((payment: any) => (
                                            <tr key={payment.id} className="border-b">
                                                <td className="p-3">{new Date(payment.paid_at).toLocaleDateString()}</td>
                                                <td className="p-3 text-right font-medium">KES {Number(payment.amount).toFixed(2)}</td>
                                                <td className="p-3">
                                                    {payment.method ? (
                                                        <Badge className={
                                                            payment.method.name.toLowerCase() === 'cash'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : payment.method.name.toLowerCase() === 'mpesa'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    : ''
                                                        }>
                                                            {payment.method.name.charAt(0).toUpperCase() + payment.method.name.slice(1)}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Unknown</Badge>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {payment.mpesa_transaction?.transaction_id || payment.reference || '—'}
                                                </td>
                                                <td className="p-3">
                                                    {payment.receivedBy ? (
                                                        <span className="flex items-center gap-2">
                                                            <UserCircle className="h-4 w-4" />
                                                            {payment.receivedBy.name}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <PermissionGuard permission="billing.view" fallback={null}>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={`/payments/receipt/${payment.id}`}>
                                                                <Receipt className="mr-1 h-4 w-4" />
                                                                Receipt
                                                            </a>
                                                        </Button>
                                                    </PermissionGuard>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
