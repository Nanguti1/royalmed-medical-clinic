import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { FlaskConical, FileText, Play, CheckCircle } from 'lucide-react';
import type { LabOrder } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    orders: LabOrder[];
};

export default function LaboratoryIndex() {
    const { orders } = usePage<PageProps>().props;

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

    return (
        <>
            <Head title="Laboratory" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laboratory</h1>
                        <p className="text-muted-foreground">
                            Laboratory orders and results
                        </p>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <EmptyState
                        icon={FlaskConical}
                        title="No laboratory orders"
                        description="There are no laboratory orders to process."
                    />
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <LabOrderCard key={order.id} order={order} getStatusBadge={getStatusBadge} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function LabOrderCard({ order, getStatusBadge }: { order: LabOrder; getStatusBadge: (status: string) => any }) {
    const patientName = order.visit?.patient
        ? [order.visit.patient.first_name, order.visit.patient.other_names, order.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const date = new Date(order.created_at).toLocaleDateString();
    const testNames = order.items?.map((item) => item.test?.name).filter(Boolean).join(', ') || 'No tests';

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <FlaskConical className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{patientName}</h3>
                            <p className="text-sm text-muted-foreground">
                                Lab Order #{order.id} • {date} • {testNames}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {getStatusBadge(order.status)}
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/laboratory/${order.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
