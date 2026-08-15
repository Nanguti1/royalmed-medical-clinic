import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Plus } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InsuranceScheme } from '@/types/insurance';

type PageProps = {
    schemes: {
        data: InsuranceScheme[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        insurer_id?: number;
    };
};

export default function InsuranceSchemesIndex() {
    const { schemes, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        insurer_id: filters.insurer_id,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/insurance/schemes', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Insurance Schemes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Insurance Schemes</h1>
                        <p className="text-muted-foreground">Manage insurance schemes and coverage plans.</p>
                    </div>
                    <Button asChild>
                        <a href="/insurance/schemes/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Scheme
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or code..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="w-40">
                                <Select
                                    value={data.insurer_id?.toString()}
                                    onValueChange={(value) => setData('insurer_id', value ? parseInt(value) : null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All insurers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All insurers</SelectItem>
                                        {schemes.data.map((scheme) => scheme.insurer && (
                                            <SelectItem key={scheme.insurer.id} value={scheme.insurer.id.toString()}>
                                                {scheme.insurer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {processing ? (
                    <LoadingState count={5} />
                ) : schemes.data.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No schemes found"
                        description="Try adjusting your search terms or create a new scheme."
                        action={{
                            label: 'New Scheme',
                            onClick: () => (window.location.href = '/insurance/schemes/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {schemes.data.map((scheme) => (
                                <SchemeCard key={scheme.id} scheme={scheme} />
                            ))}
                        </div>
                        {schemes.links && schemes.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {schemes.links.map((link: any, index: number) => (
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

function SchemeCard({ scheme }: { scheme: InsuranceScheme }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/insurance/schemes/${scheme.id}/edit`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{scheme.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{scheme.code}</p>
                    </div>
                    <Badge variant={scheme.is_active ? 'default' : 'secondary'}>
                        {scheme.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    {scheme.insurer && (
                        <p className="text-muted-foreground">Insurer: {scheme.insurer.name}</p>
                    )}
                    <p className="text-muted-foreground">Type: {scheme.coverage_type}</p>
                    {scheme.annual_limit && (
                        <p className="text-muted-foreground">Annual Limit: ${scheme.annual_limit.toLocaleString()}</p>
                    )}
                    {scheme.copayment_percentage && (
                        <p className="text-muted-foreground">Copayment: {scheme.copayment_percentage}%</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
