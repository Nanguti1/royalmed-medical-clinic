import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, User, Calendar, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { DoctorPerformance, DoctorProductivity } from '@/types/report';

type PageProps = {
    performance: DoctorPerformance | null;
    productivity: DoctorProductivity;
    filters: {
        doctor_id: number | null;
        start_date: string;
        end_date: string;
    };
};

export default function DoctorPerformanceReport() {
    const { performance, productivity, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        doctor_id: filters.doctor_id?.toString() || '',
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get('/reports/doctor-performance', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Doctor Performance Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Doctor Performance</h1>
                        <p className="text-muted-foreground">Doctor productivity and performance metrics.</p>
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
                                <Label htmlFor="doctor_id">Doctor</Label>
                                <Input
                                    id="doctor_id"
                                    type="number"
                                    value={data.doctor_id}
                                    onChange={(e) => setData('doctor_id', e.target.value)}
                                    placeholder="Enter doctor ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={processing}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Generate
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {!performance ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Select a doctor to view performance data</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{performance.total_consultations}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${performance.total_revenue.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{performance.average_consultation_time}m</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                                    <Star className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{performance.patient_satisfaction_score.toFixed(1)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>By Service Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(performance.by_service_type).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="text-sm">{type}</span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Productivity Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {productivity.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                                            <div className="flex gap-4">
                                                <span className="text-sm">{item.consultations} consultations</span>
                                                <span className="text-sm">${item.revenue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </>
    );
}
