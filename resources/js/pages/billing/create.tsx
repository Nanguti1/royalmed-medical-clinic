import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, User, FileText } from 'lucide-react';
import type { Visit } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    visit: Visit;
    billableItems: Array<{
        type: string;
        description: string;
        quantity: number;
        unit_price: number;
        reference_id: number;
    }>;
};

export default function BillingCreate() {
    const { visit, billableItems } = usePage<PageProps>().props;

    const { post, processing } = useForm({
        visit_id: visit.id,
        items: billableItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })),
    });

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/billing');
    };

    const calculateTotal = () => {
        return billableItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateSubtotal = () => {
        return calculateTotal();
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.16; // 16% tax rate
    };

    const calculateGrandTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    return (
        <>
            <Head title="Generate Invoice" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/visits/${visit.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Generate Invoice</h1>
                        <p className="text-muted-foreground">
                            Invoice for {patientName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Patient & Visit Info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <p className="font-medium">{patientName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visit ID</p>
                                <p className="font-medium">#{visit.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visit Date</p>
                                <p className="font-medium">{new Date(visit.visit_date || visit.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billable Items */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Billable Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {billableItems.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No billable items found for this visit.
                                    </p>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3">Description</th>
                                                        <th className="text-right p-3">Qty</th>
                                                        <th className="text-right p-3">Unit Price</th>
                                                        <th className="text-right p-3">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {billableItems.map((item, index) => (
                                                        <tr key={index} className="border-b">
                                                            <td className="p-3">{item.description}</td>
                                                            <td className="p-3 text-right">{item.quantity}</td>
                                                            <td className="p-3 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                                            <td className="p-3 text-right">{Number(item.quantity * item.unit_price).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Totals */}
                                        <div className="space-y-2 pt-4 border-t">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span className="font-medium">{Number(calculateSubtotal()).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tax (16%)</span>
                                                <span className="font-medium">{Number(calculateTax()).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span>{Number(calculateGrandTotal()).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-4 pt-4">
                                            <Button type="button" variant="outline" asChild>
                                                <a href={`/visits/${visit.id}`}>Cancel</a>
                                            </Button>
                                            <PermissionGuard permission="billing.create" fallback={null}>
                                                <Button type="submit" disabled={processing || billableItems.length === 0}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    {processing ? 'Generating...' : 'Generate Invoice'}
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
