import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, User, Calendar, Smartphone, FileText, CheckCircle, UserCircle } from 'lucide-react';

type PageProps = {
    payment: {
        id: number;
        amount: number;
        paid_at: string;
        reference: string | null;
        invoice: {
            id: number;
            invoice_number: string;
            total_amount: number;
            due_amount: number;
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
                };
            };
            items: Array<{
                id: number;
                description: string;
                quantity: number;
                unit_price: number;
                total_price: number;
            }>;
        };
        method: {
            id: number;
            name: string;
            provider: string | null;
        } | null;
        mpesaTransaction: {
            transaction_id: string;
            phone: string | null;
            amount: number;
            status: string | null;
            occurred_at: string | null;
        } | null;
        receivedBy: {
            id: number;
            name: string;
        } | null;
    };
    remainingBalance: number;
};

export default function PaymentShow() {
    const { payment, remainingBalance } = usePage<PageProps>().props;

    const patientName = payment.invoice.visit.patient
        ? [payment.invoice.visit.patient.first_name, payment.invoice.visit.patient.other_names, payment.invoice.visit.patient.last_name].filter(Boolean).join(' ')
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

    const getMethodBadge = (methodName: string | null) => {
        if (!methodName) return <Badge variant="outline">Unknown</Badge>;

        const name = methodName.toLowerCase();
        if (name === 'cash') {
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Cash</Badge>;
        }
        if (name === 'mpesa') {
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">M-Pesa</Badge>;
        }
        return <Badge variant="outline">{methodName}</Badge>;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Payment Receipt - ${payment.invoice.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between no-print">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={`/billing/${payment.invoice.id}`}>
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Payment Receipt</h1>
                            <p className="text-muted-foreground">
                                Invoice {payment.invoice.invoice_number}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href={`/payments/receipt/${payment.id}`}>
                                View Receipt
                            </a>
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            Print This Page
                        </Button>
                    </div>
                </div>

                {/* Success Message */}
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Payment Recorded Successfully</h3>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Payment of KES {Number(payment.amount).toFixed(2)} has been recorded.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Payment ID</span>
                                <span className="font-medium">#{payment.id}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span className="font-bold text-lg text-primary">
                                    KES {Number(payment.amount).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span>{getMethodBadge(payment.method?.name || null)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Payment Date</span>
                                <span className="font-medium">
                                    {new Date(payment.paid_at).toLocaleDateString()} at{' '}
                                    {new Date(payment.paid_at).toLocaleTimeString()}
                                </span>
                            </div>
                            {payment.receivedBy && (
                                <div className="flex justify-between items-center pb-3 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <UserCircle className="h-4 w-4" />
                                        Received By
                                    </span>
                                    <span className="font-medium">{payment.receivedBy.name}</span>
                                </div>
                            )}
                            {payment.mpesaTransaction && (
                                <>
                                    <div className="flex justify-between items-center pb-3 border-b">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Smartphone className="h-4 w-4" />
                                            M-Pesa Reference
                                        </span>
                                        <span className="font-medium">{payment.mpesaTransaction.transaction_id}</span>
                                    </div>
                                    {payment.mpesaTransaction.phone && (
                                        <div className="flex justify-between items-center pb-3 border-b">
                                            <span className="text-muted-foreground">Phone Number</span>
                                            <span className="font-medium">{payment.mpesaTransaction.phone}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            {payment.reference && !payment.mpesaTransaction && (
                                <div className="flex justify-between items-center pb-3 border-b">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="font-medium">{payment.reference}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Invoice Number</span>
                                <a
                                    href={`/billing/${payment.invoice.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {payment.invoice.invoice_number}
                                </a>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Patient</span>
                                <span className="font-medium">{patientName}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Invoice Total</span>
                                <span className="font-medium">KES {Number(payment.invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-muted-foreground">Remaining Balance</span>
                                <span className={`font-bold text-lg ${remainingBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                    KES {Number(remainingBalance).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-muted-foreground">Invoice Status</span>
                                {payment.invoice.status && getStatusBadge(payment.invoice.status.code)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice Items */}
                {payment.invoice.items && payment.invoice.items.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                        {payment.invoice.items.map((item) => (
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
                        </CardContent>
                    </Card>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 no-print">
                    <Button variant="outline" asChild>
                        <a href="/payments">View All Payments</a>
                    </Button>
                    <Button asChild>
                        <a href={`/billing/${payment.invoice.id}`}>Back to Invoice</a>
                    </Button>
                </div>
            </div>
        </>
    );
}
