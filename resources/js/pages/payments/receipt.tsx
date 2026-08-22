import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

type PageProps = {
    receipt: {
        clinic: {
            name: string;
            location: string;
            phone: string;
            email: string;
        };
        receipt: {
            number: string | null;
            date: string;
            payment_id: number;
        };
        patient: {
            name: string;
            phone: string | null;
        };
        payment: {
            amount: number;
            method: string | null;
            reference: string | null;
            mpesa_reference: string | null;
            received_by: string | null;
        };
        invoice: {
            number: string;
            total: number;
            previously_paid: number;
            current_payment: number;
            total_paid: number;
            outstanding: number;
            status: string | null;
            items: Array<{
                description: string;
                quantity: number;
                unit_price: number;
                total_price: number;
            }>;
        };
    };
};

export default function PaymentReceipt() {
    const { receipt } = usePage<PageProps>().props;

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return `KES ${Number(amount).toFixed(2)}`;
    };

    return (
        <>
            <Head title={`Receipt ${receipt.receipt.number}`} />
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                {/* Screen-only navigation */}
                <div className="no-print mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <a href={`/payments/${receipt.receipt.payment_id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                </div>

                {/* Receipt */}
                <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg">
                    {/* Header */}
                    <div className="text-center mb-8 border-b pb-6">
                        <h1 className="text-2xl font-bold mb-2">{receipt.clinic.name}</h1>
                        <p className="text-gray-600">{receipt.clinic.location}</p>
                        <p className="text-gray-600">{receipt.clinic.phone}</p>
                        <p className="text-gray-600">{receipt.clinic.email}</p>
                    </div>

                    {/* Receipt Info */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-center">PAYMENT RECEIPT</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Receipt No:</span>
                                <span className="font-semibold ml-2">{receipt.receipt.number || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Date:</span>
                                <span className="font-semibold ml-2">{formatDate(receipt.receipt.date)} at {formatTime(receipt.receipt.date)}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Invoice:</span>
                                <span className="font-semibold ml-2">{receipt.invoice.number}</span>
                            </div>
                        </div>
                    </div>

                    {/* Patient */}
                    <div className="mb-8 border-t pt-4">
                        <h3 className="font-bold mb-3">PATIENT</h3>
                        <div className="text-sm">
                            <div>
                                <span className="text-gray-600">Name:</span>
                                <span className="ml-2">{receipt.patient.name}</span>
                            </div>
                            {receipt.patient.phone && (
                                <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="ml-2">{receipt.patient.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="mb-8 border-t pt-4">
                        <h3 className="font-bold mb-3">PAYMENT</h3>
                        <div className="text-sm space-y-2">
                            <div>
                                <span className="text-gray-600">Method:</span>
                                <span className="ml-2 font-semibold uppercase">{receipt.payment.method || 'N/A'}</span>
                            </div>
                            {receipt.payment.mpesa_reference && (
                                <div>
                                    <span className="text-gray-600">M-Pesa Reference:</span>
                                    <span className="ml-2">{receipt.payment.mpesa_reference}</span>
                                </div>
                            )}
                            {receipt.payment.reference && !receipt.payment.mpesa_reference && (
                                <div>
                                    <span className="text-gray-600">Reference:</span>
                                    <span className="ml-2">{receipt.payment.reference}</span>
                                </div>
                            )}
                            <div className="mt-4 pt-2 border-t">
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="ml-2 text-2xl font-bold">{formatCurrency(receipt.payment.amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Summary */}
                    <div className="mb-8 border-t pt-4">
                        <h3 className="font-bold mb-3">INVOICE SUMMARY</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Invoice Total:</span>
                                <span>{formatCurrency(receipt.invoice.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Previously Paid:</span>
                                <span>{formatCurrency(receipt.invoice.previously_paid)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Payment:</span>
                                <span>{formatCurrency(receipt.invoice.current_payment)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Total Paid:</span>
                                <span>{formatCurrency(receipt.invoice.total_paid)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Outstanding:</span>
                                <span className={receipt.invoice.outstanding <= 0 ? 'text-green-600' : 'text-orange-600'}>
                                    {formatCurrency(receipt.invoice.outstanding)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    {receipt.invoice.items && receipt.invoice.items.length > 0 && (
                        <div className="mb-8 border-t pt-4">
                            <h3 className="font-bold mb-3">INVOICE ITEMS</h3>
                            <div className="text-sm">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Description</th>
                                            <th className="text-right py-2">Qty</th>
                                            <th className="text-right py-2">Unit Price</th>
                                            <th className="text-right py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipt.invoice.items.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-2">{item.description}</td>
                                                <td className="py-2 text-right">{item.quantity}</td>
                                                <td className="py-2 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                                <td className="py-2 text-right">{Number(item.total_price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-4 text-center text-sm text-gray-600">
                        <div className="mb-2">
                            <span className="text-gray-600">Received By:</span>
                            <span className="ml-2 font-semibold">{receipt.payment.received_by || 'N/A'}</span>
                        </div>
                        <p>Thank you for choosing Royalmed Medical Clinic.</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                }
            `}</style>
        </>
    );
}
