import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Preauthorization } from '@/types/insurance';

type PageProps = {
    preauthorizations: {
        data: Preauthorization[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function PreauthorizationsIndex() {
    const { preauthorizations, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        status: filters.status,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/insurance/preauthorizations', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'expired':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Preauthorizations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Preauthorizations</h1>
                        <p className="text-muted-foreground">Manage treatment preauthorizations.</p>
                    </div>
                    <Button asChild>
                        <a href="/insurance/preauthorizations/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Preauthorization
                        </a>
                    </Button>
                </div>

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
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {processing ? (
                    <LoadingState count={5} />
                ) : preauthorizations.data.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No preauthorizations found"
                        description="Try adjusting your search terms or create a new preauthorization."
                        action={{
                            label: 'New Preauthorization',
                            onClick: () => (window.location.href = '/insurance/preauthorizations/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {preauthorizations.data.map((preauth) => (
                                <PreauthCard key={preauth.id} preauth={preauth} getStatusColor={getStatusColor} />
                            ))}
                        </div>
                        {preauthorizations.links && preauthorizations.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {preauthorizations.links.map((link: any, index: number) => (
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

function PreauthCard({ preauth, getStatusColor }: { preauth: Preauthorization; getStatusColor: (status: string) => string }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/insurance/preauthorizations/${preauth.id}/approve`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {preauth.patient?.first_name} {preauth.patient?.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{preauth.patient?.hospital_number}</p>
                    </div>
                    <Badge className={getStatusColor(preauth.status)}>
                        {preauth.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Request Date: {new Date(preauth.request_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-muted-foreground">Service: {preauth.service_type}</p>
                    <p className="text-muted-foreground">Estimated Cost: ${preauth.estimated_cost.toLocaleString()}</p>
                    {preauth.authorized_amount && (
                        <p className="text-muted-foreground">Authorized: ${preauth.authorized_amount.toLocaleString()}</p>
                    )}
                    {preauth.insurer && (
                        <p className="text-muted-foreground">Insurer: {preauth.insurer.name}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
