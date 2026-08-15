import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Users, FlaskConical, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { PatientStatistics, DiseaseStatistics, LaboratoryReport } from '@/types/report';

type DentalReport = {
    total_procedures: number;
    by_procedure_type: Record<string, number>;
    total_revenue: number;
    patient_count: number;
};

type PageProps = {
    patient_stats: PatientStatistics;
    disease_stats: DiseaseStatistics;
    lab_report: LaboratoryReport;
    dental_report: DentalReport;
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function ShaMohReport() {
    const { patient_stats, disease_stats, lab_report, dental_report, filters } = usePage<PageProps>().props;

    const handleFilter = (startDate: string, endDate: string) => {
        window.location.href = `/reports/sha-moh?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <>
            <Head title="SHA/MOH Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">SHA/MOH Report</h1>
                        <p className="text-muted-foreground">Statutory reporting for health authorities.</p>
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
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patient_stats.total_patients}</div>
                            <p className="text-xs text-muted-foreground">
                                {patient_stats.new_patients} new
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disease Cases</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{disease_stats.total_cases}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lab_report.total_tests}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dental Procedures</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dental_report.total_procedures}</div>
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
                            <CardTitle>Disease Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(disease_stats.by_disease).map(([disease, count]) => (
                                    <div key={disease} className="flex justify-between items-center">
                                        <span className="text-sm">{disease}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
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
                                <span className="text-sm">Avg Turnaround</span>
                                <span className="font-medium">{lab_report.average_turnaround_time} mins</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dental Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm">Total Procedures</span>
                                <span className="font-medium">{dental_report.total_procedures}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Total Revenue</span>
                                <span className="font-medium">${dental_report.total_revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Patient Count</span>
                                <span className="font-medium">{dental_report.patient_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
