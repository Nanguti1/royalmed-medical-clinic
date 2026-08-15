import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/empty-state';
import type { VerificationRequest } from '@/types/laboratory';

type PageProps = {
    requests: VerificationRequest[];
};

export default function Verification() {
    const { requests } = usePage<PageProps>().props;
    const { data, setData, post, processing } = useForm({
        request_id: '',
        action: '',
        rejection_reason: '',
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleVerify = (requestId: number) => {
        setData('request_id', requestId.toString());
        setData('action', 'verify');
        post('/laboratory/verification', {
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    const handleReject = (requestId: number) => {
        setData('request_id', requestId.toString());
        setData('action', 'reject');
        post('/laboratory/verification', {
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    return (
        <>
            <Head title="Result Verification" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Result Verification</h1>
                        <p className="text-muted-foreground">Verify and approve laboratory results before release.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">
                            {requests.filter(r => r.status === 'pending').length} Pending
                        </span>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <EmptyState
                        icon={CheckCircle}
                        title="No verification requests"
                        description="All results have been verified."
                    />
                ) : (
                    <div className="grid gap-4">
                        {requests.map((request) => (
                            <Card key={request.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{request.test_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">Lab Result #{request.lab_result_id}</p>
                                        </div>
                                        <Badge className={getStatusColor(request.status)}>
                                            {request.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Result:</span>
                                                <span className="font-medium">{request.result_value}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reference Range:</span>
                                                <span className="font-medium">{request.reference_range}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Requested By:</span>
                                                <span className="font-medium">{request.requester?.name}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {request.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{request.patient.first_name} {request.patient.last_name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Requested At:</span>
                                                <span className="font-medium">{new Date(request.requested_at).toLocaleString()}</span>
                                            </div>
                                            {request.verifier && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Verified By:</span>
                                                    <span className="font-medium">{request.verifier.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="mt-4 pt-4 border-t space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`rejection-${request.id}`}>Rejection Reason (if rejecting)</Label>
                                                <textarea
                                                    id={`rejection-${request.id}`}
                                                    value={data.request_id === request.id.toString() ? data.rejection_reason : ''}
                                                    onChange={(e) => setData('rejection_reason', e.target.value)}
                                                    placeholder="Provide reason for rejection..."
                                                    rows={2}
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleVerify(request.id)}
                                                    disabled={processing}
                                                    className="flex-1"
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Verify
                                                </Button>
                                                <Button
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={processing}
                                                    variant="destructive"
                                                    className="flex-1"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {request.rejection_reason && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-red-600">
                                                <strong>Rejection Reason:</strong> {request.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
