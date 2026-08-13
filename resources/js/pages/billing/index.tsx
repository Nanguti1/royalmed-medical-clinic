import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { FileText, DollarSign, User } from 'lucide-react';
import type { Invoice } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    invoices: {
        data: Invoice[];
        links: any;
        meta: any;
    };
    search: string;
    status: string;
};

export default function BillingIndex() {
    const { invoices, search, status } = usePage<PageProps>().props;

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

    const handleSearch = (value: string) => {
        router.get('/billing', { search: value, status }, { preserveState: true });
    };

    const handleStatusFilter = (value: string) => {
        router.get('/billing', { search, status: value }, { preserveState: true });
    };

    return (
        <>
            <Head title="Billing" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                        <p className="text-muted-foreground">
                            Invoice management and tracking
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by invoice number, patient name, or phone..."
                                    defaultValue={search}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <select
                                defaultValue={status}
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onChange={(e) => handleStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="partial">Partially Paid</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices List */}
                {invoices.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No invoices found"
                        description="There are no invoices matching your search criteria."
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {invoices.data.map((invoice) => (
                                <InvoiceCard key={invoice.id} invoice={invoice} getStatusBadge={getStatusBadge} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {invoices.links && invoices.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {invoices.links.map((link: any, index: number) => (
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
            </div>
        </>
    );
}

function InvoiceCard({ invoice, getStatusBadge }: { invoice: Invoice; getStatusBadge: (code: string) => any }) {
    const patientName = invoice.visit?.patient
        ? [invoice.visit.patient.first_name, invoice.visit.patient.other_names, invoice.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const date = new Date(invoice.created_at).toLocaleDateString();

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{invoice.invoice_number}</h3>
                            <p className="text-sm text-muted-foreground">
                                {patientName} • Visit #{invoice.visit_id} • {date}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold">{Number(invoice.total_amount).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Due: {Number(invoice.due_amount).toFixed(2)}</p>
                        </div>
                        {invoice.status && getStatusBadge(invoice.status.code)}
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/billing/${invoice.id}`}>
                                <User className="mr-2 h-4 w-4" />
                                View
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
