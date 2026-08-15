import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { DiseaseStatistics, ConsultationStatistics } from '@/types/report';

type PageProps = {
    disease_stats: DiseaseStatistics;
    consultation_stats: ConsultationStatistics;
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function DiseaseReport() {
    const { disease_stats, consultation_stats, filters } = usePage<PageProps>().props;

    const handleFilter = (startDate: string, endDate: string) => {
        window.location.href = `/reports/disease?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <>
            <Head title="Disease Surveillance Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Disease Surveillance</h1>
                        <p className="text-muted-foreground">Track disease patterns and outbreaks.</p>
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
                            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{disease_stats.total_cases}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mild</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{disease_stats.by_severity.mild}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Moderate</CardTitle>
                            <Activity className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{disease_stats.by_severity.moderate}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Severe/Critical</CardTitle>
                            <Activity className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{disease_stats.by_severity.severe + disease_stats.by_severity.critical}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Disease Breakdown</CardTitle>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>By Age Group</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(disease_stats.by_age_group).map(([group, count]) => (
                                    <div key={group} className="flex justify-between items-center">
                                        <span className="text-sm">{group}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Consultation Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium">Total Consultations</p>
                                <p className="text-2xl font-bold">{consultation_stats.total_consultations}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Average Duration</p>
                                <p className="text-2xl font-bold">{consultation_stats.average_duration} mins</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium">By Consultation Type</p>
                            <div className="space-y-2 mt-2">
                                {Object.entries(consultation_stats.by_type).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center">
                                        <span className="text-sm">{type}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium">By Time of Day</p>
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Morning</span>
                                    <span className="font-medium">{consultation_stats.by_time_of_day.morning}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Afternoon</span>
                                    <span className="font-medium">{consultation_stats.by_time_of_day.afternoon}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Evening</span>
                                    <span className="font-medium">{consultation_stats.by_time_of_day.evening}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
