import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    FlaskConical,
    Filter,
    X,
    Download,
    AlertTriangle,
    CheckCircle,
    Search,
} from 'lucide-react';
import type { PortalLabResult } from '@/types/portal';

type PageProps = {
    labResults: PortalLabResult[];
    filters: {
        test_type?: string;
        date_from?: string;
        date_to?: string;
        status?: string;
    };
};

export default function PatientLabResults() {
    const { labResults, filters } = usePage<PageProps>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (result: PortalLabResult) => {
        if (result.is_critical) {
            return <Badge variant="destructive">Critical</Badge>;
        }
        if (result.is_abnormal) {
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Abnormal</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Normal</Badge>;
    };

    const clearFilters = () => {
        window.location.href = '/portal/patient/lab-results';
    };

    const filteredResults = labResults.filter(result => {
        if (filters.status === 'critical' && !result.is_critical) return false;
        if (filters.status === 'abnormal' && !result.is_abnormal) return false;
        if (filters.status === 'normal' && (result.is_abnormal || result.is_critical)) return false;
        return true;
    });

    return (
        <>
            <Head title="Lab Results" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
                        <p className="text-muted-foreground">
                            View your laboratory test results
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search tests..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.status || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('status', e.target.value);
                                        } else {
                                            url.searchParams.delete('status');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Results</option>
                                    <option value="critical">Critical</option>
                                    <option value="abnormal">Abnormal</option>
                                    <option value="normal">Normal</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    defaultValue={filters.date_from || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('date_from', e.target.value);
                                        } else {
                                            url.searchParams.delete('date_from');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    defaultValue={filters.date_to || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('date_to', e.target.value);
                                        } else {
                                            url.searchParams.delete('date_to');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                        </div>
                        {(filters.status || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Lab Results List */}
                {filteredResults.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No lab results found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredResults.map((result) => (
                            <Card key={result.id} className={result.is_critical ? 'border-red-500' : ''}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                result.is_critical ? 'bg-red-100 dark:bg-red-900/20' :
                                                result.is_abnormal ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                'bg-green-100 dark:bg-green-900/20'
                                            }`}>
                                                {result.is_critical ? (
                                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                ) : result.is_abnormal ? (
                                                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                                ) : (
                                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium">{result.test_name}</p>
                                                    {getStatusBadge(result)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{formatDate(result.test_date)}</span>
                                                    {result.test_type && <span>• {result.test_type}</span>}
                                                </div>
                                                {result.ordered_by && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Ordered by: {result.ordered_by}
                                                    </p>
                                                )}
                                                {result.verified_at && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Verified: {formatDate(result.verified_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/portal/patient/lab-results/${result.id}`}>
                                                View Details
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}