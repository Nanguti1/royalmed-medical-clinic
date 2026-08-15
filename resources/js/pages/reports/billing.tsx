import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { FinancialReport, RevenueTrends, PatientGrowth, WaitingTimeStatistics } from '@/types/report';

type PageProps = {
    financial_report: FinancialReport;
    revenue_trends: RevenueTrends;
    patient_growth: PatientGrowth;
    waiting_time_stats: WaitingTimeStatistics;
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function BillingReport() {
    const { financial_report, revenue_trends, patient_growth, waiting_time_stats, filters } = usePage<PageProps>().props;

    const handleFilter = (startDate: string, endDate: string) => {
        window.location.href = `/reports/billing?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <>
            <Head title="Billing Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Billing Report</h1>
                        <p className="text-muted-foreground">Financial performance and billing metrics.</p>
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
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${financial_report.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Net: ${financial_report.net_profit.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${financial_report.total_expenses.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{waiting_time_stats.average_waiting_time}m</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patient_growth.length > 0 ? patient_growth[patient_growth.length - 1].new_patients : 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">By Payment Method</p>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Cash</span>
                                        <span className="font-medium">${financial_report.by_payment_method.cash.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Insurance</span>
                                        <span className="font-medium">${financial_report.by_payment_method.insurance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Credit</span>
                                        <span className="font-medium">${financial_report.by_payment_method.credit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">By Service Type</p>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Consultations</span>
                                        <span className="font-medium">${financial_report.by_service_type.consultations.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Lab Tests</span>
                                        <span className="font-medium">${financial_report.by_service_type.lab_tests.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Pharmacy</span>
                                        <span className="font-medium">${financial_report.by_service_type.pharmacy.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Procedures</span>
                                        <span className="font-medium">${financial_report.by_service_type.procedures.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Waiting Time Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm">Average</span>
                                <span className="font-medium">{waiting_time_stats.average_waiting_time} mins</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Median</span>
                                <span className="font-medium">{waiting_time_stats.median_waiting_time} mins</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Maximum</span>
                                <span className="font-medium">{waiting_time_stats.max_waiting_time} mins</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium">By Time of Day</p>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Morning</span>
                                        <span className="font-medium">{waiting_time_stats.by_time_of_day.morning} mins</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Afternoon</span>
                                        <span className="font-medium">{waiting_time_stats.by_time_of_day.afternoon} mins</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Evening</span>
                                        <span className="font-medium">{waiting_time_stats.by_time_of_day.evening} mins</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {revenue_trends.map((trend, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                                    <span className="font-medium">${trend.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Patient Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {patient_growth.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                                    <div className="flex gap-4">
                                        <span className="text-sm">{item.new_patients} new</span>
                                        <span className="text-sm">{item.total_patients} total</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
