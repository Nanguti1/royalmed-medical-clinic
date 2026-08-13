import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Plus, Search, Stethoscope } from 'lucide-react';
import type { Visit } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    visits: {
        data: Visit[];
        links: any;
        meta: any;
    };
    search: string;
};

export default function VisitIndex() {
    const { visits, search } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: search,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/visits', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Visits" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Visits</h1>
                        <p className="text-muted-foreground">
                            Manage patient visits and triage
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/visits/queue">
                                <Stethoscope className="mr-2 h-4 w-4" />
                                Queue
                            </a>
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

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by patient name..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Visit List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : visits.data.length === 0 ? (
                    <EmptyState
                        icon={Stethoscope}
                        title="No visits found"
                        description={search ? 'Try adjusting your search terms.' : 'Get started by creating your first visit.'}
                        action={
                            !search && {
                                label: 'Create Visit',
                                onClick: () => (window.location.href = '/visits/create'),
                            }
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {visits.data.map((visit) => (
                                <VisitCard key={visit.id} visit={visit} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {visits.links && visits.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {visits.links.map((link: any, index: number) => (
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

function VisitCard({ visit }: { visit: Visit }) {
    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const isStarted = visit.started_at !== null;
    const isCompleted = visit.completed_at !== null;
    const isCancelled = visit.cancelled_at !== null;

    const getStatusColor = () => {
        if (isCancelled) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        if (isCompleted) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (isStarted) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    };

    const getStatusText = () => {
        if (isCancelled) return 'Cancelled';
        if (isCompleted) return 'Completed';
        if (isStarted) return 'In Progress';
        return 'Pending';
    };

    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/visits/${visit.id}`)}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{patientName}</h3>
                            <p className="text-sm text-muted-foreground">
                                Visit #{visit.id} • {new Date(visit.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className={getStatusColor()}>{getStatusText()}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
