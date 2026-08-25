import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Plus, Clock, DollarSign, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InsuranceClaim } from '@/types/insurance';

type PageProps = {
    claims: {
        data: InsuranceClaim[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        insurer_id?: number;
    };
};

export default function ClaimsIndex() {
    const { claims, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        status: filters.status,
        insurer_id: filters.insurer_id,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/billing/claims', {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
            <Head title="Insurance Claims" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Insurance Claims</h1>
                        <p className="text-muted-foreground">Manage insurance claims and submissions.</p>
                    </div>

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
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="partially_approved">Partially Approved</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {processing ? (
                    <LoadingState count={5} />
                ) : claims.data.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No claims found"
                        description="Try adjusting your search terms."
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {claims.data.map((claim) => (
                                <ClaimCard key={claim.id} claim={claim} getStatusColor={getStatusColor} />
                            ))}
                        </div>
                        {claims.links && claims.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {claims.links.map((link: any, index: number) => (
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

function ClaimCard({ claim, getStatusColor }: { claim: InsuranceClaim; getStatusColor: (status: string) => string }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/billing/claims/${claim.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{claim.claim_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {claim.patient?.first_name} {claim.patient?.last_name} ({claim.patient?.hospital_number})
                        </p>
                    </div>
                    <Badge className={getStatusColor(claim.status)}>
                        {claim.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Claimed:</span>
                        <span>${claim.amount_claimed.toLocaleString()}</span>
                    </div>
                    {claim.amount_approved && (
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Approved:</span>
                            <span>${claim.amount_approved.toLocaleString()}</span>
                        </div>
                    )}
                    {claim.amount_paid && (
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Paid:</span>
                            <span>${claim.amount_paid.toLocaleString()}</span>
                        </div>
                    )}
                    {claim.insurer && (
                        <p className="text-muted-foreground">Insurer: {claim.insurer.name}</p>
                    )}
                    {claim.invoice && (
                        <p className="text-muted-foreground">Invoice: {claim.invoice.invoice_number}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
