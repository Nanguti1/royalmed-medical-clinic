import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    CreditCard,
    DollarSign,
    Plus,
    Trash2,
    Lock,
} from 'lucide-react';
import { useState } from 'react';

type PaymentSplit = {
    id: string;
    method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'insurance';
    amount: number;
    transaction_id?: string;
};

type PageProps = {
    invoice: {
        id: number;
        invoice_number: string;
        total_amount: number;
        paid_amount: number;
        due_amount: number;
    };
    paymentMethods: Array<{
        id: string;
        name: string;
    }>;
};

export default function SplitPayment() {
    const { invoice, paymentMethods } = usePage<PageProps>().props;

    const [splits, setSplits] = useState<PaymentSplit[]>([
        { id: '1', method: 'cash', amount: invoice.due_amount },
    ]);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('invoice_id', invoice.id.toString());
        splits.forEach((split, index) => {
            formData.append(`splits[${index}][method]`, split.method);
            formData.append(`splits[${index}][amount]`, split.amount.toString());
            if (split.transaction_id) {
                formData.append(`splits[${index}][transaction_id]`, split.transaction_id);
            }
        });

        router.post('/payments/split', formData, {
            onFinish: () => setProcessing(false),
        });
    };

    const addSplit = () => {
        setSplits([...splits, {
            id: Date.now().toString(),
            method: 'cash',
            amount: 0,
        }]);
    };

    const removeSplit = (id: string) => {
        if (splits.length > 1) {
            setSplits(splits.filter(s => s.id !== id));
        }
    };

    const updateSplit = (id: string, field: keyof PaymentSplit, value: any) => {
        setSplits(splits.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
    const remainingAmount = invoice.due_amount - totalSplitAmount;
    const isComplete = remainingAmount === 0;

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'card':
                return <CreditCard className="h-5 w-5" />;
            case 'cash':
                return <DollarSign className="h-5 w-5" />;
            case 'bank_transfer':
                return <Lock className="h-5 w-5" />;
            default:
                return <CreditCard className="h-5 w-5" />;
        }
    };

    return (
        <>
            <Head title="Split Payment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/billing/${invoice.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Split Payment</h1>
                        <p className="text-muted-foreground">
                            Pay invoice #{invoice.invoice_number} using multiple payment methods
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Invoice Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                <p className="font-medium">{invoice.invoice_number}</p>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Total Amount</span>
                                    <span className="font-medium">${invoice.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Already Paid</span>
                                    <span className="font-medium text-green-600">${invoice.paid_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="font-medium">Amount Due</span>
                                    <span className="font-bold text-lg">${invoice.due_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Split Payment Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Splits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Payment Splits */}
                                <div className="space-y-4">
                                    {splits.map((split, index) => (
                                        <div key={split.id} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">Payment Method {index + 1}</p>
                                                {splits.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeSplit(split.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Method</Label>
                                                    <select
                                                        value={split.method}
                                                        onChange={(e) => updateSplit(split.id, 'method', e.target.value as any)}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    >
                                                        {paymentMethods.map((method) => (
                                                            <option key={method.id} value={method.id}>
                                                                {method.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Amount</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max={invoice.due_amount}
                                                        value={split.amount}
                                                        onChange={(e) => updateSplit(split.id, 'amount', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>

                                            {split.method === 'card' && (
                                                <div className="space-y-2">
                                                    <Label>Card Number</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                        onChange={(e) => updateSplit(split.id, 'transaction_id', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {split.method === 'bank_transfer' && (
                                                <div className="space-y-2">
                                                    <Label>Transaction Reference</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="Bank reference number"
                                                        onChange={(e) => updateSplit(split.id, 'transaction_id', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addSplit}
                                        className="w-full"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Payment Method
                                    </Button>
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Total Allocated</span>
                                        <span className="font-medium">${totalSplitAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Remaining</span>
                                        <span className={`font-medium ${remainingAmount < 0 ? 'text-red-600' : ''}`}>
                                            ${remainingAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    {!isComplete && (
                                        <p className="text-xs text-muted-foreground">
                                            {remainingAmount > 0
                                                ? `$${remainingAmount.toFixed(2)} remaining to allocate`
                                                : `Overallocated by $${Math.abs(remainingAmount).toFixed(2)}`}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Split Payment:</strong> This will create multiple payment records for this invoice. Each payment method will be processed separately.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/billing/${invoice.id}`}>Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={!isComplete || processing}>
                                        <Lock className="mr-2 h-4 w-4" />
                                        {processing ? 'Processing...' : `Pay $${invoice.due_amount.toFixed(2)}`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}