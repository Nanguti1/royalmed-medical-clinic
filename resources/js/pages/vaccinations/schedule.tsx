import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { VaccinationSchedule } from '@/types/vaccination';

type PageProps = {
    schedule: VaccinationSchedule;
    age_months: number;
};

export default function VaccinationSchedule() {
    const { schedule, age_months } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        age_months: age_months.toString(),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/vaccinations/schedule', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Vaccination Schedule" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/vaccinations">
                            <Calendar className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Vaccination Schedule</h1>
                        <p className="text-muted-foreground">Recommended vaccination schedule by age.</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Enter age in months..."
                                    value={data.age_months}
                                    onChange={(e) => setData('age_months', e.target.value)}
                                    type="number"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>View Schedule</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Age: {schedule.age_months} months</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedule.required_vaccines.length === 0 ? (
                            <EmptyState
                                icon={Clock}
                                title="No vaccinations required"
                                description="No vaccinations are recommended for this age."
                            />
                        ) : (
                            <div className="space-y-4">
                                {schedule.required_vaccines.map((item, index) => (
                                    <div key={index} className="p-4 border rounded">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium">{item.vaccine.name}</h3>
                                                <p className="text-sm text-muted-foreground">{item.vaccine.code}</p>
                                            </div>
                                            <Badge>Dose {item.dose_number}</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-muted-foreground">Recommended Age: {item.recommended_age}</p>
                                            {item.vaccine.manufacturer && (
                                                <p className="text-muted-foreground">Manufacturer: {item.vaccine.manufacturer}</p>
                                            )}
                                            {item.vaccine.description && (
                                                <p className="text-muted-foreground">{item.vaccine.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
