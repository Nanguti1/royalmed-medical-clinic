import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { PurchaseOrder } from '@/types/pharmacy';

type PageProps = {
    orders: PurchaseOrder[];
};

export default function PurchaseOrdersIndex() {
    const { orders } = usePage<PageProps>().props;

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
            case 'submitted':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Purchase Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                        <p className="text-muted-foreground">Manage purchase orders and supplier relationships.</p>
                    </div>
                    <Button asChild>
                        <a href="/pharmacy/purchase-orders/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Order
                        </a>
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No purchase orders found"
                        description="No purchase orders have been created."
                    />
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{order.order_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{order.supplier?.name}</p>
                                        </div>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Order Date:</span>
                                                <span className="font-medium">{new Date(order.order_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Expected Delivery:</span>
                                                <span className="font-medium">{new Date(order.expected_delivery_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Amount:</span>
                                                <span className="font-medium">${order.total_amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {order.creator && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Created By:</span>
                                                    <span className="font-medium">{order.creator.name}</span>
                                                </div>
                                            )}
                                            {order.approver && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Approved By:</span>
                                                    <span className="font-medium">{order.approver.name}</span>
                                                </div>
                                            )}
                                            {order.approved_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Approved At:</span>
                                                    <span className="font-medium">{new Date(order.approved_at).toLocaleString()}</span>
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
