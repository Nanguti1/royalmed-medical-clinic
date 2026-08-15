import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, FlaskConical, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { LaboratoryReport } from '@/types/report';

type PageProps = {
    lab_report: LaboratoryReport;
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function LabReport() {
    const { lab_report, filters } = usePage<PageProps>().props;

    const handleFilter = (startDate: string, endDate: string) => {
        window.location.href = `/reports/lab?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <>
            <Head title="Laboratory Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Laboratory Report</h1>
                        <p className="text-muted-foreground">Laboratory testing statistics and performance.</p>
                    </div>
                    <div className="flex gap-2">
                        <DateRangePicker
                            startDate={filters.start_date}
                            endDate={filters.end_date}
                            onFilter={handleFilter}
                        />
                        <ExportButtons
                            onExportPDF={() => console.log('Export PDF')}
                            onExportExcel={() => console.log('Export Excel')}
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lab_report.total_tests}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lab_report.completed_tests}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lab_report.pending_tests}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lab_report.average_turnaround_time}m</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tests by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(lab_report.by_test_type).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center">
                                    <span className="text-sm">{type}</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
