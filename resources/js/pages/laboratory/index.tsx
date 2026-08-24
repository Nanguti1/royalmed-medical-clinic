import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { FlaskConical, FileText, Play, CheckCircle } from 'lucide-react';
import type { LabOrder } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    orders: {
        data: LabOrder[];
        links: any;
        meta: any;
    };
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

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'stat':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">STAT</Badge>;
            case 'urgent':
                return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">URGENT</Badge>;
            case 'routine':
            default:
                return null;
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
                {orders.data.length === 0 ? (
                    <EmptyState
                        icon={FlaskConical}
                        title="No laboratory orders"
                        description="There are no laboratory orders to process."
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {orders.data.map((order) => (
                                <LabOrderCard key={order.id} order={order} getStatusBadge={getStatusBadge} getPriorityBadge={getPriorityBadge} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {orders.links && orders.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {orders.links.map((link: any, index: number) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function LabOrderCard({ order, getStatusBadge, getPriorityBadge }: { order: LabOrder; getStatusBadge: (status: string) => any; getPriorityBadge: (priority: string) => any }) {
    const patientName = order.visit?.patient
        ? [order.visit.patient.first_name, order.visit.patient.other_names, order.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const date = new Date(order.created_at).toLocaleDateString();
    const testNames = order.items?.map((item) => item.test?.name).filter(Boolean).join(', ') || 'No tests';

    return (
        <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{patientName}</CardTitle>
                    <div className="flex gap-2">
                        {getPriorityBadge(order.priority)}
                        {getStatusBadge(order.status)}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">Lab Order #{order.id}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Tests: {testNames}</p>
                    <p className="text-muted-foreground">Ordered {date}</p>
                    <div className="flex gap-2 mt-2">
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
