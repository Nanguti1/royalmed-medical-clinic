import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { StockAdjustment } from '@/types/pharmacy';

type PageProps = {
    adjustments: StockAdjustment[];
};

export default function StockAdjustmentsIndex() {
    const { adjustments } = usePage<PageProps>().props;

    const getAdjustmentTypeColor = (type: string) => {
        switch (type) {
            case 'addition':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'subtraction':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'damage':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'expiry':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'theft':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'correction':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Stock Adjustments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
                        <p className="text-muted-foreground">Track inventory adjustments and approvals.</p>
                    </div>
                    <Button asChild>
                        <a href="/pharmacy/adjustments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Adjustment
                        </a>
                    </Button>
                </div>

                {adjustments.length === 0 ? (
                    <EmptyState
                        icon={AlertTriangle}
                        title="No adjustments found"
                        description="No stock adjustments have been recorded."
                    />
                ) : (
                    <div className="grid gap-4">
                        {adjustments.map((adjustment) => (
                            <Card key={adjustment.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {adjustment.medicine?.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">{adjustment.medicine?.generic_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={getAdjustmentTypeColor(adjustment.adjustment_type)}>
                                                {adjustment.adjustment_type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Badge>
                                            <Badge className={getStatusColor(adjustment.status)}>
                                                {adjustment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span className="font-medium">{adjustment.quantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reason:</span>
                                                <span className="font-medium">{adjustment.reason}</span>
                                            </div>
                                            {adjustment.reference_number && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Reference:</span>
                                                    <span className="font-medium">{adjustment.reference_number}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {adjustment.performer && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Performed By:</span>
                                                    <span className="font-medium">{adjustment.performer.name}</span>
                                                </div>
                                            )}
                                            {adjustment.performed_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Performed At:</span>
                                                    <span className="font-medium">{new Date(adjustment.performed_at).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {adjustment.approver && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Approved By:</span>
                                                    <span className="font-medium">{adjustment.approver.name}</span>
                                                </div>
                                            )}
                                            {adjustment.approved_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Approved At:</span>
                                                    <span className="font-medium">{new Date(adjustment.approved_at).toLocaleString()}</span>
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
