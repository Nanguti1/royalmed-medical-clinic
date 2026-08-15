import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Plus, Clock, DollarSign } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DentalProcedure } from '@/types/dental';

type PageProps = {
    procedures: {
        data: DentalProcedure[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        category?: string;
    };
};

export default function ProceduresIndex() {
    const { procedures, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        category: filters.category,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/dental/procedures', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Dental Procedures" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dental Procedures</h1>
                        <p className="text-muted-foreground">
                            Manage dental procedure catalogue.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/dental">Dental Dashboard</a>
                        </Button>
                        <Button asChild>
                            <a href="/dental/procedures/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Procedure
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
                                    placeholder="Search by name or code..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="w-40">
                                <Select
                                    value={data.category}
                                    onValueChange={(value) => setData('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All categories</SelectItem>
                                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                        <SelectItem value="preventive">Preventive</SelectItem>
                                        <SelectItem value="restorative">Restorative</SelectItem>
                                        <SelectItem value="prosthetic">Prosthetic</SelectItem>
                                        <SelectItem value="surgical">Surgical</SelectItem>
                                        <SelectItem value="orthodontic">Orthodontic</SelectItem>
                                        <SelectItem value="endodontic">Endodontic</SelectItem>
                                        <SelectItem value="periodontic">Periodontic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Procedures List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : procedures.data.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No procedures found"
                        description="Try adjusting your search terms or create a new procedure."
                        action={{
                            label: 'New Procedure',
                            onClick: () => (window.location.href = '/dental/procedures/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {procedures.data.map((procedure) => (
                                <ProcedureCard key={procedure.id} procedure={procedure} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {procedures.links && procedures.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {procedures.links.map((link: any, index: number) => (
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

function ProcedureCard({ procedure }: { procedure: DentalProcedure }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/dental/procedures/${procedure.id}/edit`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{procedure.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{procedure.code}</p>
                    </div>
                    <Badge variant={procedure.is_active ? 'default' : 'secondary'}>
                        {procedure.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{procedure.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Base Cost:</span>
                        <span>${procedure.base_cost.toLocaleString()}</span>
                    </div>
                    {procedure.duration_minutes && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Duration:</span>
                            <span>{procedure.duration_minutes} min</span>
                        </div>
                    )}
                    {procedure.anesthesia_required && (
                        <Badge variant="destructive">Anesthesia Required</Badge>
                    )}
                    {procedure.description && (
                        <p className="text-muted-foreground">{procedure.description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
