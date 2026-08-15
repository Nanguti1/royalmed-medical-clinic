import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, FileText, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DentalTreatmentPlan } from '@/types/dental';

type PageProps = {
    plans: {
        data: DentalTreatmentPlan[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function TreatmentPlansIndex() {
    const { plans, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        status: filters.status,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/dental/treatment-plans', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Treatment Plans" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Treatment Plans</h1>
                        <p className="text-muted-foreground">
                            Manage dental treatment plans for patients.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/dental">Dental Dashboard</a>
                        </Button>
                        <Button asChild>
                            <a href="/dental/treatment-plans/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Treatment Plan
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by patient name or hospital number..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="w-40">
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Plans List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : plans.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No treatment plans found"
                        description="Try adjusting your search terms or create a new treatment plan."
                        action={{
                            label: 'New Treatment Plan',
                            onClick: () => (window.location.href = '/dental/treatment-plans/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {plans.data.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} getStatusColor={getStatusColor} getPriorityColor={getPriorityColor} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {plans.links && plans.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {plans.links.map((link: any, index: number) => (
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

function PlanCard({ plan, getStatusColor, getPriorityColor }: { plan: DentalTreatmentPlan; getStatusColor: (status: string) => string; getPriorityColor: (priority: string) => string }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/dental/treatment-plans/${plan.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {plan.patient?.first_name} {plan.patient?.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.patient?.hospital_number}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(plan.status)}>
                            {plan.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Plan Date: {new Date(plan.plan_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Procedures: {plan.procedures?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Estimated Cost:</span>
                        <span>${plan.estimated_cost.toLocaleString()}</span>
                    </div>
                    {plan.actual_cost && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Actual Cost:</span>
                            <span>${plan.actual_cost.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
