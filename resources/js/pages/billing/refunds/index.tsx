import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, ArrowLeftRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Refund } from '@/types/billing';

type PageProps = {
    refunds: Refund[];
};

export default function RefundsIndex() {
    const { refunds } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'processed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Refunds" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
                        <p className="text-muted-foreground">Track and manage refund requests.</p>
                    </div>
                    <Button asChild>
                        <a href="/billing/refunds/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Refund
                        </a>
                    </Button>
                </div>

                {refunds.length === 0 ? (
                    <EmptyState
                        icon={ArrowLeftRight}
                        title="No refunds found"
                        description="No refund requests have been created."
                    />
                ) : (
                    <div className="grid gap-4">
                        {refunds.map((refund) => (
                            <Card key={refund.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{refund.refund_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{refund.invoice?.invoice_number}</p>
                                        </div>
                                        <Badge className={getStatusColor(refund.status)}>
                                            {refund.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Amount:</span>
                                                <span className="font-medium">${refund.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Method:</span>
                                                <span className="font-medium">{refund.refund_method}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reason:</span>
                                                <span className="font-medium">{refund.reason}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {refund.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{refund.patient.first_name} {refund.patient.last_name}</span>
                                                </div>
                                            )}
                                            {refund.processor && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Processed By:</span>
                                                    <span className="font-medium">{refund.processor.name}</span>
                                                </div>
                                            )}
                                            {refund.refund_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Refund Date:</span>
                                                    <span className="font-medium">{new Date(refund.refund_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
