import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Plus, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VaccinationRecord } from '@/types/vaccination';

type PageProps = {
    records: {
        data: VaccinationRecord[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function VaccinationsIndex() {
    const { records, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
        status: filters.status,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/vaccinations', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'administered':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'skipped':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Vaccinations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Vaccinations</h1>
                        <p className="text-muted-foreground">Manage vaccination records and schedules.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/vaccinations/schedule">
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="/vaccinations/certificates">
                                Certificates
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/vaccinations/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Record Vaccination
                            </a>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by record number or patient name..."
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
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="administered">Administered</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="skipped">Skipped</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {processing ? (
                    <LoadingState count={5} />
                ) : records.data.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No vaccination records found"
                        description="Try adjusting your search terms or record a new vaccination."
                        action={{
                            label: 'Record Vaccination',
                            onClick: () => (window.location.href = '/vaccinations/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {records.data.map((record) => (
                                <VaccinationCard key={record.id} record={record} getStatusColor={getStatusColor} />
                            ))}
                        </div>
                        {records.links && records.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {records.links.map((link: any, index: number) => (
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

function VaccinationCard({ record, getStatusColor }: { record: VaccinationRecord; getStatusColor: (status: string) => string }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/vaccinations/${record.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{record.record_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {record.patient?.first_name} {record.patient?.last_name} ({record.patient?.hospital_number})
                        </p>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Date: {new Date(record.administration_date).toLocaleDateString()}</span>
                    </div>
                    {record.vaccine && (
                        <p className="text-muted-foreground">Vaccine: {record.vaccine.name}</p>
                    )}
                    <p className="text-muted-foreground">Dose: {record.dose_number}</p>
                    <p className="text-muted-foreground">Site: {record.site.replace('_', ' ')}</p>
                    {record.reactions && (
                        <p className="text-muted-foreground text-red-600">Reactions: {record.reactions}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
