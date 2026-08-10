import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, Smartphone, Users, Calendar, UserCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    date: string;
    summary: {
        cash_total: number;
        mpesa_total: number;
        total_amount: number;
        cash_count: number;
        mpesa_count: number;
        total_count: number;
    };
    cashPayments: Array<{
        id: number;
        amount: number;
        paid_at: string;
        reference: string | null;
        invoice: {
            invoice_number: string;
            visit: {
                patient: {
                    first_name: string;
                    other_names: string | null;
                    last_name: string;
                };
            };
        };
        receivedBy: {
            name: string;
        } | null;
    }>;
    mpesaPayments: Array<{
        id: number;
        amount: number;
        paid_at: string;
        invoice: {
            invoice_number: string;
            visit: {
                patient: {
                    first_name: string;
                    other_names: string | null;
                    last_name: string;
                };
            };
        };
        mpesaTransaction: {
            transaction_id: string;
        } | null;
        receivedBy: {
            name: string;
        } | null;
    }>;
    staffBreakdown: Array<{
        user_id: number;
        user_name: string;
        cash_total: number;
        mpesa_total: number;
        total_amount: number;
        cash_count: number;
        mpesa_count: number;
        total_count: number;
    }>;
};

export default function PaymentReconciliation() {
    const { date, summary, cashPayments, mpesaPayments, staffBreakdown } = usePage<PageProps>().props;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        window.location.href = `/payments/reconciliation?date=${e.target.value}`;
    };

    const getPatientName = (patient: any) => {
        return [patient.first_name, patient.other_names, patient.last_name].filter(Boolean).join(' ');
    };

    const formatCurrency = (amount: number) => {
        return `KES ${Number(amount).toFixed(2)}`;
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head title="Daily Payment Reconciliation" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/payments">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Daily Payment Reconciliation</h1>
                            <p className="text-muted-foreground">
                                Financial summary and transaction breakdown
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <span className="text-2xl font-bold">{formatCurrency(summary.total_amount)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Collected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-2xl font-bold">{formatCurrency(summary.cash_total)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{summary.cash_count} transactions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">M-Pesa Collected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-blue-600" />
                                <span className="text-2xl font-bold">{formatCurrency(summary.mpesa_total)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{summary.mpesa_count} transactions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="text-2xl font-bold">{summary.total_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Cash Collections */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                Cash Collections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cashPayments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3">Time</th>
                                                <th className="text-left p-3">Invoice</th>
                                                <th className="text-left p-3">Patient</th>
                                                <th className="text-right p-3">Amount</th>
                                                <th className="text-left p-3">Received By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cashPayments.map((payment) => (
                                                <tr key={payment.id} className="border-b">
                                                    <td className="p-3">{formatTime(payment.paid_at)}</td>
                                                    <td className="p-3">{payment.invoice.invoice_number}</td>
                                                    <td className="p-3">{getPatientName(payment.invoice.visit.patient)}</td>
                                                    <td className="p-3 text-right font-medium">{formatCurrency(payment.amount)}</td>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No cash payments recorded</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* M-Pesa Collections */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-blue-600" />
                                M-Pesa Collections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mpesaPayments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3">Time</th>
                                                <th className="text-left p-3">Invoice</th>
                                                <th className="text-left p-3">Patient</th>
                                                <th className="text-left p-3">Reference</th>
                                                <th className="text-right p-3">Amount</th>
                                                <th className="text-left p-3">Received By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mpesaPayments.map((payment) => (
                                                <tr key={payment.id} className="border-b">
                                                    <td className="p-3">{formatTime(payment.paid_at)}</td>
                                                    <td className="p-3">{payment.invoice.invoice_number}</td>
                                                    <td className="p-3">{getPatientName(payment.invoice.visit.patient)}</td>
                                                    <td className="p-3">
                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {payment.mpesaTransaction?.transaction_id || '—'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-right font-medium">{formatCurrency(payment.amount)}</td>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No M-Pesa payments recorded</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Collections by Staff */}
                {staffBreakdown.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Collections by Staff
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {staffBreakdown.map((staff) => (
                                    <div key={staff.user_id} className="border rounded-lg p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <UserCircle className="h-4 w-4" />
                                            {staff.user_name}
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Cash:</span>
                                                <span className="font-medium">{formatCurrency(staff.cash_total)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">M-Pesa:</span>
                                                <span className="font-medium">{formatCurrency(staff.mpesa_total)}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold pt-2 border-t">
                                                <span>Total:</span>
                                                <span>{formatCurrency(staff.total_amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{staff.total_count} transactions</span>
                                                <span>({staff.cash_count} cash, {staff.mpesa_count} M-Pesa)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
