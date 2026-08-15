import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { StockTransfer } from '@/types/pharmacy';

type PageProps = {
    transfers: StockTransfer[];
};

export default function StockTransfersIndex() {
    const { transfers } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Stock Transfers" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Stock Transfers</h1>
                        <p className="text-muted-foreground">Track inventory transfers between locations.</p>
                    </div>
                    <Button asChild>
                        <a href="/pharmacy/transfers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Transfer
                        </a>
                    </Button>
                </div>

                {transfers.length === 0 ? (
                    <EmptyState
                        icon={ArrowRight}
                        title="No transfers found"
                        description="No stock transfers have been recorded."
                    />
                ) : (
                    <div className="grid gap-4">
                        {transfers.map((transfer) => (
                            <Card key={transfer.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {transfer.medicine?.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">{transfer.medicine?.generic_name}</p>
                                        </div>
                                        <Badge className={getStatusColor(transfer.status)}>
                                            {transfer.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">From:</span>
                                                <span className="font-medium">{transfer.from_location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">To:</span>
                                                <span className="font-medium">{transfer.to_location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span className="font-medium">{transfer.quantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reference:</span>
                                                <span className="font-medium">{transfer.reference_number}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Transfer Date:</span>
                                                <span className="font-medium">{new Date(transfer.transfer_date).toLocaleDateString()}</span>
                                            </div>
                                            {transfer.requester && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Requested By:</span>
                                                    <span className="font-medium">{transfer.requester.name}</span>
                                                </div>
                                            )}
                                            {transfer.approver && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Approved By:</span>
                                                    <span className="font-medium">{transfer.approver.name}</span>
                                                </div>
                                            )}
                                            {transfer.receiver && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Received By:</span>
                                                    <span className="font-medium">{transfer.receiver.name}</span>
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
