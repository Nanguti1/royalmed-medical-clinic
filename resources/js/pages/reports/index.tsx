import { Head, usePage } from '@inertiajs/react';
import { BarChart3, Users, DollarSign, FlaskConical, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { PatientStatistics, FinancialReport, LaboratoryReport, InventoryReport } from '@/types/report';

type PageProps = {
    patient_stats: PatientStatistics;
    financial_report: FinancialReport;
    lab_report: LaboratoryReport;
    inventory_report: InventoryReport;
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function ReportsIndex() {
    const { patient_stats, financial_report, lab_report, inventory_report, filters } = usePage<PageProps>().props;

    const handleFilter = (startDate: string, endDate: string) => {
        window.location.href = `/reports?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <>
            <Head title="Reports Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
                        <p className="text-muted-foreground">Overview of key metrics and statistics.</p>
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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patient_stats.total_patients}</div>
                            <p className="text-xs text-muted-foreground">
                                {patient_stats.new_patients} new this period
                            </p>
                        </CardContent>
                    </Card>

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
                            <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lab_report.total_tests}</div>
                            <p className="text-xs text-muted-foreground">
                                {lab_report.completed_tests} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inventory_report.total_items}</div>
                            <p className="text-xs text-muted-foreground">
                                {inventory_report.low_stock_items} low stock
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">By Gender</p>
                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <p className="text-2xl font-bold">{patient_stats.by_gender.male}</p>
                                        <p className="text-xs text-muted-foreground">Male</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{patient_stats.by_gender.female}</p>
                                        <p className="text-xs text-muted-foreground">Female</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{patient_stats.by_gender.other}</p>
                                        <p className="text-xs text-muted-foreground">Other</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">By Age Group</p>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {Object.entries(patient_stats.by_age_group).map(([group, count]) => (
                                        <div key={group} className="text-center">
                                            <p className="text-lg font-bold">{count}</p>
                                            <p className="text-xs text-muted-foreground">{group}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Laboratory Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm">Total Tests</span>
                                <span className="font-medium">{lab_report.total_tests}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Completed</span>
                                <span className="font-medium">{lab_report.completed_tests}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Pending</span>
                                <span className="font-medium">{lab_report.pending_tests}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Avg Turnaround</span>
                                <span className="font-medium">{lab_report.average_turnaround_time} mins</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm">Total Items</span>
                                <span className="font-medium">{inventory_report.total_items}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Low Stock</span>
                                <span className="font-medium text-yellow-600">{inventory_report.low_stock_items}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Out of Stock</span>
                                <span className="font-medium text-red-600">{inventory_report.out_of_stock_items}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Expiring Soon</span>
                                <span className="font-medium text-orange-600">{inventory_report.expiring_soon}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Total Value</span>
                                <span className="font-medium">${inventory_report.total_value.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
