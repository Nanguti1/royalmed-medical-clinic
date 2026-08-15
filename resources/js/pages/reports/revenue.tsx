import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { RevenueReport, RevenueTrends } from '@/types/report';

type PageProps = {
    report: RevenueReport;
    trends: RevenueTrends;
    filters: {
        type: string;
        date: string;
        year: number;
        month: number;
    };
};

export default function RevenueReport() {
    const { report, trends, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        type: filters.type,
        date: filters.date,
        year: filters.year.toString(),
        month: filters.month.toString(),
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get('/reports/revenue', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Revenue Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Revenue Report</h1>
                        <p className="text-muted-foreground">Financial performance analysis.</p>
                    </div>
                    <ExportButtons
                        onExportPDF={() => console.log('Export PDF')}
                        onExportExcel={() => console.log('Export Excel')}
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Report Type</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => setData('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.type === 'daily' && (
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                </div>
                            )}

                            {data.type === 'monthly' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            value={data.year}
                                            onChange={(e) => setData('year', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="month">Month</Label>
                                        <Input
                                            id="month"
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={data.month}
                                            onChange={(e) => setData('month', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-end">
                                <Button type="submit" disabled={processing}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Generate
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${report.total_revenue.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${report.consultations.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${report.lab_tests.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pharmacy</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${report.pharmacy.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Consultations</span>
                                <span className="font-medium">${report.consultations.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Lab Tests</span>
                                <span className="font-medium">${report.lab_tests.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Pharmacy</span>
                                <span className="font-medium">${report.pharmacy.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Procedures</span>
                                <span className="font-medium">${report.procedures.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center font-bold">
                                <span>Total</span>
                                <span>${report.total_revenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trends (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {trends.map((trend, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                                    <span className="font-medium">${trend.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
