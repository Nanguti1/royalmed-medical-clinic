import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { PaymentPlan } from '@/types/billing';

type PageProps = {
    paymentPlans: PaymentPlan[];
};

export default function PaymentPlansIndex() {
    const { paymentPlans } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'defaulted':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Payment Plans" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Payment Plans</h1>
                        <p className="text-muted-foreground">Manage installment payment plans for patients.</p>
                    </div>
                    <Button asChild>
                        <a href="/billing/payment-plans/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Payment Plan
                        </a>
                    </Button>
                </div>

                {paymentPlans.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No payment plans found"
                        description="No payment plans have been created."
                    />
                ) : (
                    <div className="grid gap-4">
                        {paymentPlans.map((plan) => (
                            <Card key={plan.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{plan.plan_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{plan.invoice?.invoice_number}</p>
                                        </div>
                                        <Badge className={getStatusColor(plan.status)}>
                                            {plan.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Amount:</span>
                                                <span className="font-medium">${plan.total_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Paid:</span>
                                                <span className="font-medium">${plan.paid_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Remaining:</span>
                                                <span className="font-medium">${plan.remaining_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Installments:</span>
                                                <span className="font-medium">{plan.installment_count} × ${plan.installment_amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {plan.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{plan.patient.first_name} {plan.patient.last_name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Frequency:</span>
                                                <span className="font-medium">{plan.frequency.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Start Date:</span>
                                                <span className="font-medium">{new Date(plan.start_date).toLocaleDateString()}</span>
                                            </div>
                                            {plan.next_payment_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Next Payment:</span>
                                                    <span className="font-medium">{new Date(plan.next_payment_date).toLocaleDateString()}</span>
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
