import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Package, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { GoodsReceivedNote } from '@/types/pharmacy';

type PageProps = {
    grns: GoodsReceivedNote[];
};

export default function GRNIndex() {
    const { grns } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'verified':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Goods Received Notes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/pharmacy/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Goods Received Notes</h1>
                        <p className="text-muted-foreground">Track received stock and verify deliveries.</p>
                    </div>
                    <Button asChild>
                        <a href="/pharmacy/grn/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New GRN
                        </a>
                    </Button>
                </div>

                {grns.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="No GRNs found"
                        description="No goods received notes have been created."
                    />
                ) : (
                    <div className="grid gap-4">
                        {grns.map((grn) => (
                            <Card key={grn.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{grn.grn_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{grn.supplier?.name}</p>
                                        </div>
                                        <Badge className={getStatusColor(grn.status)}>
                                            {grn.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Received Date:</span>
                                                <span className="font-medium">{new Date(grn.received_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Quantity:</span>
                                                <span className="font-medium">{grn.total_quantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Value:</span>
                                                <span className="font-medium">${grn.total_value.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {grn.receiver && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Received By:</span>
                                                    <span className="font-medium">{grn.receiver.name}</span>
                                                </div>
                                            )}
                                            {grn.notes && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Notes:</span>
                                                    <span className="font-medium">{grn.notes}</span>
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
