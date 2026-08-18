import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Plus, RefreshCw, Users, X } from 'lucide-react';
import type { QueueEntry } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    entries: QueueEntry[];
};

export default function VisitQueue() {
    const { entries } = usePage<PageProps>().props;

    const handleRefresh = () => {
        router.reload();
    };

    const handleRemove = (entryId: number) => {
        if (confirm('Are you sure you want to remove this patient from the queue?')) {
            router.delete(`/visits/queue/${entryId}`, {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleAddToQueue = (visitId: number) => {
        router.post(`/visits/${visitId}/queue`, {
            department: 'consultation',
            priority: 'normal',
        }, {
            onSuccess: () => {
                router.reload();
            },
            onError: (errors) => {
                console.error('Failed to add to queue:', errors);
            }
        });
    };

    return (
        <>
            <Head title="Waiting Queue" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Waiting Queue</h1>
                        <p className="text-muted-foreground">
                            Patients waiting to be seen
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <PermissionGuard permission="visits.create" fallback={null}>
                            <Button asChild>
                                <a href="/visits/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Visit
                                </a>
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Queue List */}
                {entries.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="Queue is empty"
                        description="No patients are currently waiting in the queue."
                    />
                ) : (
                    <div className="grid gap-4">
                        {entries.map((entry) => (
                            <QueueCard
                                key={entry.id}
                                entry={entry}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function QueueCard({ entry, onRemove }: { entry: QueueEntry; onRemove: (id: number) => void }) {
    const patientName = entry.visit?.patient
        ? [entry.visit.patient.first_name, entry.visit.patient.other_names, entry.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'called':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in_progress':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-lg font-bold text-primary">{entry.position || '–'}</span>
                        </div>
                        <div>
                            <h3 className="font-semibold">{patientName}</h3>
                            <p className="text-sm text-muted-foreground">
                                Visit #{entry.visit_id} • Added {new Date(entry.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(entry.status)}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('_', ' ')}
                        </Badge>
                        <PermissionGuard permission="visits.update" fallback={null}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(entry.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
