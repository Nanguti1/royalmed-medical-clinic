import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Activity, Heart, Ruler, Thermometer, Weight } from 'lucide-react';
import type { Visit } from '@/types/visit';

type PageProps = {
    visit: Visit;
};

export default function VisitTriage() {
    const { visit } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        visit_id: visit.id,
        temperature_c: '',
        blood_pressure: '',
        pulse: '',
        respiratory_rate: '',
        weight_kg: '',
        height_cm: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/visits/${visit.id}/vitals`);
    };

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    return (
        <>
            <Head title="Express Triage" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/visits/${visit.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Express Triage</h1>
                        <p className="text-muted-foreground">
                            Capture vital signs for {patientName}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AlertError errors={errors} />

                            {/* Temperature */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Thermometer className="h-5 w-5" />
                                    Temperature
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="temperature_c">Temperature (°C)</Label>
                                        <Input
                                            id="temperature_c"
                                            type="number"
                                            step="0.1"
                                            value={data.temperature_c}
                                            onChange={(e) => setData('temperature_c', e.target.value)}
                                            placeholder="36.5"
                                        />
                                        <InputError message={errors.temperature_c} />
                                    </div>
                                </div>
                            </div>

                            {/* Blood Pressure */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Blood Pressure
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="blood_pressure">Blood Pressure</Label>
                                        <Input
                                            id="blood_pressure"
                                            value={data.blood_pressure}
                                            onChange={(e) => setData('blood_pressure', e.target.value)}
                                            placeholder="120/80"
                                        />
                                        <InputError message={errors.blood_pressure} />
                                    </div>
                                </div>
                            </div>

                            {/* Pulse */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Pulse
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="pulse">Pulse (bpm)</Label>
                                        <Input
                                            id="pulse"
                                            type="number"
                                            value={data.pulse}
                                            onChange={(e) => setData('pulse', e.target.value)}
                                            placeholder="72"
                                        />
                                        <InputError message={errors.pulse} />
                                    </div>
                                </div>
                            </div>

                            {/* Respiratory Rate */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Respiratory Rate
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="respiratory_rate">Respiratory Rate (breaths/min)</Label>
                                        <Input
                                            id="respiratory_rate"
                                            type="number"
                                            value={data.respiratory_rate}
                                            onChange={(e) => setData('respiratory_rate', e.target.value)}
                                            placeholder="16"
                                        />
                                        <InputError message={errors.respiratory_rate} />
                                    </div>
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Weight className="h-5 w-5" />
                                    Weight
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight_kg">Weight (kg)</Label>
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            step="0.1"
                                            value={data.weight_kg}
                                            onChange={(e) => setData('weight_kg', e.target.value)}
                                            placeholder="70.5"
                                        />
                                        <InputError message={errors.weight_kg} />
                                    </div>
                                </div>
                            </div>

                            {/* Height */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Ruler className="h-5 w-5" />
                                    Height
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="height_cm">Height (cm)</Label>
                                        <Input
                                            id="height_cm"
                                            type="number"
                                            value={data.height_cm}
                                            onChange={(e) => setData('height_cm', e.target.value)}
                                            placeholder="175"
                                        />
                                        <InputError message={errors.height_cm} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/visits/${visit.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Vitals'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
