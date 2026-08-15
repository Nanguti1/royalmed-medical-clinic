import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DollarSign,
    Filter,
    X,
    Download,
    CreditCard,
    AlertTriangle,
    Search,
} from 'lucide-react';
import type { PortalInvoice } from '@/types/portal';

type PageProps = {
    invoices: PortalInvoice[];
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function PatientBilling() {
    const { invoices, filters } = usePage<PageProps>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Partial</Badge>;
            case 'pending':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Pending</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Overdue</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const clearFilters = () => {
        window.location.href = '/portal/patient/billing';
    };

    const totalDue = invoices.reduce((sum, invoice) => sum + invoice.due_amount, 0);
    const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0);

    return (
        <>
            <Head title="Billing" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                        <p className="text-muted-foreground">
                            View and manage your invoices and payments
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalDue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Outstanding balance</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Payments made</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search invoices..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.status || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('status', e.target.value);
                                        } else {
                                            url.searchParams.delete('status');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date Range</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="date_from"
                                        type="date"
                                        defaultValue={filters.date_from || ''}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            if (e.target.value) {
                                                url.searchParams.set('date_from', e.target.value);
                                            } else {
                                                url.searchParams.delete('date_from');
                                            }
                                            window.location.href = url.toString();
                                        }}
                                    />
                                    <Input
                                        type="date"
                                        defaultValue={filters.date_to || ''}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            if (e.target.value) {
                                                url.searchParams.set('date_to', e.target.value);
                                            } else {
                                                url.searchParams.delete('date_to');
                                            }
                                            window.location.href = url.toString();
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        {(filters.status || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Invoices List */}
                {invoices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No invoices found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4">Invoice #</th>
                                    <th className="text-left p-4">Date</th>
                                    <th className="text-left p-4">Due Date</th>
                                    <th className="text-left p-4">Total</th>
                                    <th className="text-left p-4">Paid</th>
                                    <th className="text-left p-4">Due</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b hover:bg-accent/50">
                                        <td className="p-4 font-medium">{invoice.invoice_number}</td>
                                        <td className="p-4">{formatDate(invoice.issued_date)}</td>
                                        <td className="p-4">{invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</td>
                                        <td className="p-4">${invoice.total_amount.toFixed(2)}</td>
                                        <td className="p-4">${invoice.paid_amount.toFixed(2)}</td>
                                        <td className="p-4 font-medium">${invoice.due_amount.toFixed(2)}</td>
                                        <td className="p-4">{getStatusBadge(invoice.status)}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/portal/patient/billing/${invoice.id}`}>
                                                        View
                                                    </a>
                                                </Button>
                                                {invoice.due_amount > 0 && (
                                                    <Button size="sm" asChild>
                                                        <a href={`/portal/patient/payments?invoice_id=${invoice.id}`}>
                                                            Pay
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}