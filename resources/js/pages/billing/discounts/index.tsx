import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Percent, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Discount } from '@/types/billing';

type PageProps = {
    discounts: Discount[];
};

export default function DiscountsIndex() {
    const { discounts } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Discounts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
                        <p className="text-muted-foreground">Manage discount codes and promotional offers.</p>
                    </div>
                    <Button asChild>
                        <a href="/billing/discounts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Discount
                        </a>
                    </Button>
                </div>

                {discounts.length === 0 ? (
                    <EmptyState
                        icon={Percent}
                        title="No discounts found"
                        description="No discounts have been created."
                    />
                ) : (
                    <div className="grid gap-4">
                        {discounts.map((discount) => (
                            <Card key={discount.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{discount.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">Code: {discount.code}</p>
                                        </div>
                                        <Badge className={getStatusColor(discount.status)}>
                                            {discount.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Type:</span>
                                                <div className="flex items-center gap-1">
                                                    {discount.type === 'percentage' ? (
                                                        <Percent className="h-4 w-4" />
                                                    ) : (
                                                        <DollarSign className="h-4 w-4" />
                                                    )}
                                                    <span className="font-medium">{discount.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Value:</span>
                                                <span className="font-medium">{discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}</span>
                                            </div>
                                            {discount.min_purchase_amount && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Min Purchase:</span>
                                                    <span className="font-medium">${discount.min_purchase_amount.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Start Date:</span>
                                                <span className="font-medium">{new Date(discount.start_date).toLocaleDateString()}</span>
                                            </div>
                                            {discount.end_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">End Date:</span>
                                                    <span className="font-medium">{new Date(discount.end_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {discount.usage_limit && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Usage:</span>
                                                    <span className="font-medium">{discount.usage_count} / {discount.usage_limit}</span>
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
