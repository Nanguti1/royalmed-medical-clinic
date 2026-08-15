import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { ReorderItem } from '@/types/pharmacy';

type PageProps = {
    items: ReorderItem[];
};

export default function Reorder() {
    const { items } = usePage<PageProps>().props;

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Reorder Worklist" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Reorder Worklist</h1>
                        <p className="text-muted-foreground">Medicines requiring reordering based on stock levels.</p>
                    </div>
                    <Button asChild>
                        <a href="/pharmacy/purchase-orders/create">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Create Purchase Order
                        </a>
                    </Button>
                </div>

                {items.length === 0 ? (
                    <EmptyState
                        icon={TrendingUp}
                        title="No items to reorder"
                        description="All medicines are within acceptable stock levels."
                    />
                ) : (
                    <div className="grid gap-4">
                        {items.map((item) => (
                            <Card key={item.medicine_id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{item.medicine_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{item.generic_name}</p>
                                        </div>
                                        <Badge className={getUrgencyColor(item.urgency)}>
                                            {item.urgency.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Current Stock:</span>
                                                <span className="font-medium">{item.current_stock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reorder Level:</span>
                                                <span className="font-medium">{item.reorder_level}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reorder Quantity:</span>
                                                <span className="font-medium">{item.reorder_quantity}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Avg Monthly Usage:</span>
                                                <span className="font-medium">{item.average_monthly_usage}</span>
                                            </div>
                                            {item.last_purchase_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Last Purchase:</span>
                                                    <span className="font-medium">{new Date(item.last_purchase_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {item.supplier && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Supplier:</span>
                                                        <span className="font-medium">{item.supplier.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Lead Time:</span>
                                                        <span className="font-medium">{item.supplier.lead_time_days} days</span>
                                                    </div>
                                                </>
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
