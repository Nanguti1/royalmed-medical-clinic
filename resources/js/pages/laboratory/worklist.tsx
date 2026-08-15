import { Head, usePage } from '@inertiajs/react';
import { ClipboardList, Clock, Play, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { WorklistItem } from '@/types/laboratory';

type PageProps = {
    worklist: WorklistItem[];
};

export default function LaboratoryWorklist() {
    const { worklist } = usePage<PageProps>().props;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'stat':
                return 'bg-red-600 text-white border-red-700';
            case 'urgent':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'routine':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'in_progress':
                return <Play className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const pendingCount = worklist.filter(item => item.status === 'pending').length;
    const inProgressCount = worklist.filter(item => item.status === 'in_progress').length;
    const completedCount = worklist.filter(item => item.status === 'completed').length;

    return (
        <>
            <Head title="Laboratory Worklist" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Laboratory Worklist</h1>
                        <p className="text-muted-foreground">Manage laboratory test queue and assignments.</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{worklist.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Play className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inProgressCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {worklist.length === 0 ? (
                    <EmptyState
                        icon={ClipboardList}
                        title="No items in worklist"
                        description="The laboratory worklist is empty."
                    />
                ) : (
                    <div className="grid gap-4">
                        {worklist.map((item) => (
                            <Card key={item.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{item.test_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{item.lab_order?.order_number}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={getPriorityColor(item.priority)}>
                                                {item.priority.toUpperCase()}
                                            </Badge>
                                            <Badge className={getStatusColor(item.status)}>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(item.status)}
                                                    {item.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </div>
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            {item.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{item.patient.first_name} {item.patient.last_name}</span>
                                                </div>
                                            )}
                                            {item.specimen_number && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Specimen:</span>
                                                    <span className="font-medium">{item.specimen_number}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {item.assignee && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Assigned To:</span>
                                                    <span className="font-medium">{item.assignee.name}</span>
                                                </div>
                                            )}
                                            {item.estimated_completion && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Est. Completion:</span>
                                                    <span className="font-medium">{new Date(item.estimated_completion).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {!item.assignee && item.status === 'pending' && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground text-red-600">Status:</span>
                                                    <span className="font-medium text-red-600">Unassigned</span>
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
