import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { CreditNote } from '@/types/billing';

type PageProps = {
    creditNotes: CreditNote[];
};

export default function CreditNotesIndex() {
    const { creditNotes } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'applied':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Credit Notes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
                        <p className="text-muted-foreground">Issue and manage credit notes for future payments.</p>
                    </div>
                    <Button asChild>
                        <a href="/billing/credit-notes/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Credit Note
                        </a>
                    </Button>
                </div>

                {creditNotes.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No credit notes found"
                        description="No credit notes have been issued."
                    />
                ) : (
                    <div className="grid gap-4">
                        {creditNotes.map((note) => (
                            <Card key={note.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{note.credit_note_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{note.invoice?.invoice_number}</p>
                                        </div>
                                        <Badge className={getStatusColor(note.status)}>
                                            {note.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Amount:</span>
                                                <span className="font-medium">${note.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reason:</span>
                                                <span className="font-medium">{note.reason}</span>
                                            </div>
                                            {note.expiry_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Expiry Date:</span>
                                                    <span className="font-medium">{new Date(note.expiry_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {note.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{note.patient.first_name} {note.patient.last_name}</span>
                                                </div>
                                            )}
                                            {note.approver && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Approved By:</span>
                                                    <span className="font-medium">{note.approver.name}</span>
                                                </div>
                                            )}
                                            {note.applied_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Applied Date:</span>
                                                    <span className="font-medium">{new Date(note.applied_date).toLocaleDateString()}</span>
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
