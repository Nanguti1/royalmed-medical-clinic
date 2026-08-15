import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Wallet, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Deposit } from '@/types/billing';

type PageProps = {
    deposits: Deposit[];
};

export default function DepositsIndex() {
    const { deposits } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'applied':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'refunded':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Deposits" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
                        <p className="text-muted-foreground">Track patient deposits and prepayments.</p>
                    </div>
                    <Button asChild>
                        <a href="/billing/deposits/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Deposit
                        </a>
                    </Button>
                </div>

                {deposits.length === 0 ? (
                    <EmptyState
                        icon={Wallet}
                        title="No deposits found"
                        description="No deposits have been recorded."
                    />
                ) : (
                    <div className="grid gap-4">
                        {deposits.map((deposit) => (
                            <Card key={deposit.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{deposit.deposit_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{deposit.patient?.hospital_number}</p>
                                        </div>
                                        <Badge className={getStatusColor(deposit.status)}>
                                            {deposit.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Amount:</span>
                                                <span className="font-medium">${deposit.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Method:</span>
                                                <span className="font-medium">{deposit.method.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                                            </div>
                                            {deposit.reference_number && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Reference:</span>
                                                    <span className="font-medium">{deposit.reference_number}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {deposit.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{deposit.patient.first_name} {deposit.patient.last_name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Deposit Date:</span>
                                                <span className="font-medium">{new Date(deposit.deposit_date).toLocaleDateString()}</span>
                                            </div>
                                            {deposit.invoice && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Applied To:</span>
                                                    <span className="font-medium">{deposit.invoice.invoice_number}</span>
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
