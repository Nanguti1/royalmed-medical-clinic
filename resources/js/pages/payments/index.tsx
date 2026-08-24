import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DollarSign, Smartphone, Search, ArrowLeft } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    payments: {
        data: Array<{
            id: number;
            amount: number;
            paid_at: string;
            reference: string | null;
            invoice: {
                id: number;
                invoice_number: string;
                visit: {
                    patient: {
                        first_name: string;
                        other_names: string | null;
                        last_name: string;
                    };
                };
            };
            method: {
                id: number;
                name: string;
                provider: string | null;
            } | null;
            mpesaTransaction: {
                transaction_id: string;
                phone: string | null;
            } | null;
        }>;
        links: any;
        meta: any;
    };
    search: string;
    todayTotals: {
        cash_total: number;
        mpesa_total: number;
        total_amount: number;
        cash_count: number;
        mpesa_count: number;
    } | null;
    weekTotals: {
        cash_total: number;
        mpesa_total: number;
        total_amount: number;
        cash_count: number;
        mpesa_count: number;
    } | null;
    monthTotals: {
        cash_total: number;
        mpesa_total: number;
        total_amount: number;
        cash_count: number;
        mpesa_count: number;
    } | null;
    yearTotals: {
        cash_total: number;
        mpesa_total: number;
        total_amount: number;
        cash_count: number;
        mpesa_count: number;
    } | null;
};

export default function PaymentsIndex() {
    const { payments, search, todayTotals, weekTotals, monthTotals, yearTotals } = usePage<PageProps>().props;

    const { get, processing, setData } = useForm({
        search: search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/payments');
    };

    const getPatientName = (payment: any) => {
        if (payment.invoice?.visit?.patient) {
            const { first_name, other_names, last_name } = payment.invoice.visit.patient;
            return [first_name, other_names, last_name].filter(Boolean).join(' ');
        }
        return 'Unknown Patient';
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

    return (
        <>
            <Head title="Payments Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/dashboard">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Payments Dashboard</h1>
                            <p className="text-muted-foreground">
                                Payment overview and history
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(todayTotals?.total_amount || 0).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">KES • Total collected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(weekTotals?.total_amount || 0).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">KES • Total collected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(monthTotals?.total_amount || 0).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">KES • Total collected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Year</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(yearTotals?.total_amount || 0).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">KES • Total collected</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by invoice, patient, or M-Pesa reference..."
                                        value={search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Searching...' : 'Search'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payments.data.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No payments found.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3">Date</th>
                                                <th className="text-left p-3">Invoice</th>
                                                <th className="text-left p-3">Patient</th>
                                                <th className="text-right p-3">Amount</th>
                                                <th className="text-left p-3">Method</th>
                                                <th className="text-left p-3">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.data.map((payment) => (
                                                <tr key={payment.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-3">
                                                        {new Date(payment.paid_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3">
                                                        <a
                                                            href={`/billing/${payment.invoice.id}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            {payment.invoice.invoice_number}
                                                        </a>
                                                    </td>
                                                    <td className="p-3">{getPatientName(payment)}</td>
                                                    <td className="p-3 text-right font-medium">
                                                        {Number(payment.amount).toFixed(2)}
                                                    </td>
                                                    <td className="p-3">
                                                        {getMethodBadge(payment.method?.name || null)}
                                                    </td>
                                                    <td className="p-3">
                                                        {payment.mpesaTransaction?.transaction_id || payment.reference || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                {payments.links && payments.links.length > 3 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        {payments.links.map((link: any, index: number) => (
                                            <a
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
