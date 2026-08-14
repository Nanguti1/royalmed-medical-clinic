import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FlaskConical, User, Play, CheckCircle, Edit } from 'lucide-react';
import type { LabOrder } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    order: LabOrder;
};

export default function LaboratoryShow() {
    const { order } = usePage<PageProps>().props;

    const patientName = order.visit?.patient
        ? [order.visit.patient.first_name, order.visit.patient.other_names, order.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ordered':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Processing</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleStart = () => {
        router.post(`/laboratory/${order.id}/start`);
    };

    const handleComplete = () => {
        if (confirm('Are you sure you want to complete this laboratory order?')) {
            router.post(`/laboratory/${order.id}/complete`);
        }
    };

    const handleCollectSample = () => {
        router.post(`/laboratory/${order.id}/collect-sample`);
    };

    const handleCollectSampleItem = (itemId: number) => {
        router.post(`/laboratory/${order.id}/items/${itemId}/collect`);
    };

    const handleReceiveSampleItem = (itemId: number) => {
        router.post(`/laboratory/${order.id}/items/${itemId}/receive`);
    };

    const handleProcessSampleItem = (itemId: number) => {
        router.post(`/laboratory/${order.id}/items/${itemId}/process`);
    };

    const handleCompleteSampleItem = (itemId: number) => {
        router.post(`/laboratory/${order.id}/items/${itemId}/complete`);
    };

    const handleVerifyResult = (resultId: number) => {
        router.post(`/laboratory/${order.id}/results/${resultId}/verify`);
    };

    const handleRejectResult = (resultId: number) => {
        if (confirm('Are you sure you want to reject this result?')) {
            router.post(`/laboratory/${order.id}/results/${resultId}/reject`);
        }
    };

    return (
        <>
            <Head title={`Laboratory Order #${order.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/laboratory">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Laboratory Order #{order.id}</h1>
                            <p className="text-muted-foreground">
                                Accession: <span className="font-mono font-medium">{order.accession_number || `ACC-${order.id}`}</span> • {patientName} • Visit #{order.visit_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {getStatusBadge(order.status)}
                        {order.priority === 'stat' && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">STAT</Badge>
                        )}
                        {order.priority === 'urgent' && (
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">URGENT</Badge>
                        )}
                        <Button variant="outline" asChild>
                            <a href={`/laboratory/${order.id}/print`} target="_blank" rel="noreferrer">
                                Print Report
                            </a>
                        </Button>
                        {order.visit?.patient?.id && (
                            <Button variant="outline" asChild>
                                <a href={`/laboratory/patient/${order.visit.patient.id}/history`}>
                                    Lab History
                                </a>
                            </Button>
                        )}
                        {order.status === 'ordered' && !order.sample_collected_at && (
                            <PermissionGuard permission="laboratory.order" fallback={null}>
                                <Button onClick={handleCollectSample}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Collect Sample
                                </Button>
                            </PermissionGuard>
                        )}
                        {order.status === 'ordered' && order.sample_collected_at && (
                            <PermissionGuard permission="laboratory.order" fallback={null}>
                                <Button onClick={handleStart}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Processing
                                </Button>
                            </PermissionGuard>
                        )}
                        {order.status === 'in_progress' && (
                            <PermissionGuard permission="laboratory.order" fallback={null}>
                                <Button onClick={handleComplete}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete Order
                                </Button>
                            </PermissionGuard>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Patient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient & Specimen Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <Link
                                    href={`/patients/${order.visit?.patient?.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {patientName}
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Accession Number</p>
                                <p className="font-mono font-medium">{order.accession_number || `ACC-${order.id}`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visit ID</p>
                                <p className="font-medium">#{order.visit_id}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Order Date</p>
                                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            {order.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="font-medium">{order.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tests and Results */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                Tests & Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.items && order.items.length > 0 ? (
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <Card key={item.id} className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{item.test?.name}</h4>
                                                    {item.test?.code && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.test.code}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {item.sample_status === 'pending' && (
                                                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                            Sample Pending
                                                        </Badge>
                                                    )}
                                                    {item.sample_status === 'collected' && (
                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            Sample Collected
                                                        </Badge>
                                                    )}
                                                    {item.sample_status === 'received' && (
                                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                            Sample Received
                                                        </Badge>
                                                    )}
                                                    {item.sample_status === 'processing' && (
                                                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                            Processing
                                                        </Badge>
                                                    )}
                                                    {item.sample_status === 'completed' && (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Sample Completed
                                                        </Badge>
                                                    )}
                                                    {item.result ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Result Entered
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            Result Pending
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {item.result && (
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">Result: </span>
                                                        <span className={item.result.is_abnormal ? 'text-red-600 font-medium' : ''}>
                                                            {item.result.result_value}
                                                        </span>
                                                        {item.result.is_abnormal && (
                                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                Abnormal
                                                            </Badge>
                                                        )}
                                                        {item.result.is_critical && (
                                                            <Badge className="bg-red-600 text-white">
                                                                Critical
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.result.units && (
                                                        <div>
                                                            <span className="text-muted-foreground">Units: </span>
                                                            {item.result.units}
                                                        </div>
                                                    )}
                                                    {item.result.reference_range && (
                                                        <div>
                                                            <span className="text-muted-foreground">Reference: </span>
                                                            {item.result.reference_range}
                                                        </div>
                                                    )}
                                                    {item.result.notes && (
                                                        <div>
                                                            <span className="text-muted-foreground">Notes: </span>
                                                            {item.result.notes}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <span className="text-muted-foreground">Status: </span>
                                                        {item.result.verification_status === 'verified' && (
                                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                Verified
                                                            </Badge>
                                                        )}
                                                        {item.result.verification_status === 'rejected' && (
                                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                Rejected
                                                            </Badge>
                                                        )}
                                                        {item.result.verification_status === 'pending' && (
                                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                                Pending Verification
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.result.verification_status === 'pending' && (
                                                        <div className="flex gap-2 pt-2">
                                                            <PermissionGuard permission="laboratory.result" fallback={null}>
                                                                <Button variant="outline" size="sm" onClick={() => handleVerifyResult(item.result.id)}>
                                                                    Verify
                                                                </Button>
                                                                <Button variant="outline" size="sm" onClick={() => handleRejectResult(item.result.id)}>
                                                                    Reject
                                                                </Button>
                                                            </PermissionGuard>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {!item.result && order.status === 'in_progress' && (
                                                <PermissionGuard permission="laboratory.result" fallback={null}>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`/laboratory/${order.id}/results`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Enter Result
                                                        </a>
                                                    </Button>
                                                </PermissionGuard>
                                            )}
                                            {item.sample_status === 'pending' && order.status === 'ordered' && (
                                                <PermissionGuard permission="laboratory.order" fallback={null}>
                                                    <Button variant="outline" size="sm" onClick={() => handleCollectSampleItem(item.id)}>
                                                        Collect Sample
                                                    </Button>
                                                </PermissionGuard>
                                            )}
                                            {item.sample_status === 'collected' && (
                                                <PermissionGuard permission="laboratory.order" fallback={null}>
                                                    <Button variant="outline" size="sm" onClick={() => handleReceiveSampleItem(item.id)}>
                                                        Receive Sample
                                                    </Button>
                                                </PermissionGuard>
                                            )}
                                            {item.sample_status === 'received' && (
                                                <PermissionGuard permission="laboratory.order" fallback={null}>
                                                    <Button variant="outline" size="sm" onClick={() => handleProcessSampleItem(item.id)}>
                                                        Start Processing
                                                    </Button>
                                                </PermissionGuard>
                                            )}
                                            {item.sample_status === 'processing' && (
                                                <PermissionGuard permission="laboratory.order" fallback={null}>
                                                    <Button variant="outline" size="sm" onClick={() => handleCompleteSampleItem(item.id)}>
                                                        Complete Processing
                                                    </Button>
                                                </PermissionGuard>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No tests ordered.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
