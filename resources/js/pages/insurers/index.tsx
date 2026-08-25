import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { Search, Plus } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Insurer } from '@/types/insurance';

type PageProps = {
    insurers: {
        data: Insurer[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        type?: string;
    };
};

export default function InsurersIndex() {
    const { insurers, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        type: filters.type || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/insurance/insurers', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Insurance Insurers" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Insurance Insurers</h1>
                        <p className="text-muted-foreground">
                            Manage insurance providers and their details.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/insurance/insurers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Insurer
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
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
                                    value={data.type}
                                    onValueChange={(value) => setData('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All types</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="nhif">NHIF</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Insurers List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : insurers.data.length === 0 ? (
                    <EmptyState
                        icon={Plus}
                        title="No insurers found"
                        description="Try adjusting your search terms or create a new insurer."
                        action={{
                            label: 'New Insurer',
                            onClick: () => router.visit('/insurance/insurers/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {insurers.data.map((insurer) => (
                                <InsurerCard key={insurer.id} insurer={insurer} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {insurers.links && insurers.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {insurers.links.map((link: any, index: number) => (
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

function InsurerCard({ insurer }: { insurer: Insurer }) {
    const getStatusColor = () => {
        if (insurer.is_active) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const getTypeColor = () => {
        switch (insurer.type) {
            case 'private':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'public':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'nhif':
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
            case 'corporate':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.visit(`/insurance/insurers/${insurer.id}/edit`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{insurer.name}</CardTitle>
                    <Badge className={getStatusColor()}>
                        {insurer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Insurer #{insurer.id}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 text-sm">
                    <Badge className={getTypeColor()}>
                        {insurer.type}
                    </Badge>
                    <p className="text-muted-foreground">{insurer.code}</p>
                    {insurer.contact_person && (
                        <p className="text-muted-foreground">{insurer.contact_person}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
