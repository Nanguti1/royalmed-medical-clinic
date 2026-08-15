import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    CreditCard,
    DollarSign,
    Lock,
} from 'lucide-react';
import { useState } from 'react';

type PageProps = {
    invoice: {
        id: number;
        invoice_number: string;
        total_amount: number;
        paid_amount: number;
        due_amount: number;
    };
};

export default function CardPayment() {
    const { invoice } = usePage<PageProps>().props;

    const [processing, setProcessing] = useState(false);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: '',
        amount: invoice.due_amount,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('invoice_id', invoice.id.toString());
        formData.append('payment_method', 'card');
        formData.append('amount', cardData.amount.toString());
        formData.append('card_number', cardData.cardNumber);
        formData.append('card_holder_name', cardData.cardHolderName);
        formData.append('expiry_date', cardData.expiryDate);
        formData.append('cvv', cardData.cvv);

        router.post('/payments/card', formData, {
            onFinish: () => setProcessing(false),
        });
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        if (matches) {
            return matches.join(' ');
        }
        return v;
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    };

    return (
        <>
            <Head title="Card Payment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/billing/${invoice.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Card Payment</h1>
                        <p className="text-muted-foreground">
                            Pay invoice #{invoice.invoice_number} with credit/debit card
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

                    {/* Card Payment Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Card Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Secure Payment:</strong> Your card information is encrypted and secure. We use industry-standard security measures to protect your data.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber">Card Number *</Label>
                                        <Input
                                            id="cardNumber"
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            value={cardData.cardNumber}
                                            onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cardHolderName">Cardholder Name *</Label>
                                        <Input
                                            id="cardHolderName"
                                            type="text"
                                            placeholder="Name on card"
                                            value={cardData.cardHolderName}
                                            onChange={(e) => setCardData({ ...cardData, cardHolderName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                                            <Input
                                                id="expiryDate"
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardData.expiryDate}
                                                onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV *</Label>
                                            <Input
                                                id="cvv"
                                                type="text"
                                                placeholder="123"
                                                maxLength={4}
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={invoice.due_amount}
                                            value={cardData.amount}
                                            onChange={(e) => setCardData({ ...cardData, amount: parseFloat(e.target.value) })}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum: ${invoice.due_amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/billing/${invoice.id}`}>Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Lock className="mr-2 h-4 w-4" />
                                        {processing ? 'Processing...' : `Pay $${cardData.amount.toFixed(2)}`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Card Icons */}
                <div className="flex justify-center gap-4 py-4">
                    <div className="w-12 h-8 bg-blue-600 rounded" />
                    <div className="w-12 h-8 bg-red-500 rounded" />
                    <div className="w-12 h-8 bg-yellow-500 rounded" />
                    <div className="w-12 h-8 bg-purple-600 rounded" />
                </div>
            </div>
        </>
    );
}