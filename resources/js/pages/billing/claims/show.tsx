import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, DollarSign, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { InsuranceClaim } from '@/types/insurance';

type PageProps = {
    claim: InsuranceClaim;
};

export default function ClaimShow() {
    const { claim } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'submitted':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'partially_approved':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'in_review':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'processing':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={`Claim ${claim.claim_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/claims">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Claim Details</h1>
                        <p className="text-muted-foreground">{claim.claim_number}</p>
                    </div>
                    <Badge className={getStatusColor(claim.status)}>
                        {claim.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Service Date:</span>
                                <span>{new Date(claim.service_date).toLocaleDateString()}</span>
                            </div>
                            {claim.submission_date && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Submitted:</span>
                                    <span>{new Date(claim.submission_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            {claim.approval_date && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Approved:</span>
                                    <span>{new Date(claim.approval_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            {claim.payment_date && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Paid:</span>
                                    <span>{new Date(claim.payment_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Amount Claimed:</span>
                                <span>${claim.amount_claimed.toLocaleString()}</span>
                            </div>
                            {claim.amount_approved && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Amount Approved:</span>
                                    <span>${claim.amount_approved.toLocaleString()}</span>
                                </div>
                            )}
                            {claim.amount_paid && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Amount Paid:</span>
                                    <span>${claim.amount_paid.toLocaleString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient & Insurer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium">Patient</p>
                                <p className="text-muted-foreground">
                                    {claim.patient?.first_name} {claim.patient?.last_name} ({claim.patient?.hospital_number})
                                </p>
                            </div>
                            {claim.insurer && (
                                <div>
                                    <p className="font-medium">Insurer</p>
                                    <p className="text-muted-foreground">{claim.insurer.name}</p>
                                </div>
                            )}
                            {claim.invoice && (
                                <div>
                                    <p className="font-medium">Invoice</p>
                                    <p className="text-muted-foreground">{claim.invoice.invoice_number}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {claim.rejection_reason && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejection Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{claim.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                {claim.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{claim.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {claim.status === 'rejected' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <a href={`/billing/claims/${claim.id}/resubmit`}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resubmit Claim
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <a href="/billing/claims">Back to List</a>
                            </Button>
                            <Button asChild>
                                <a href={`/billing/claims/${claim.id}/edit`}>Edit Claim</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
