import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Activity, Heart, Ruler, Thermometer, Weight, Gauge, AlertCircle, Clipboard } from 'lucide-react';
import type { Visit } from '@/types/visit';
import { useState } from 'react';

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
        oxygen_saturation: '',
        pain_score: '',
        chief_complaint: '',
        nurse_notes: '',
    });

    // Calculate BMI automatically
    const bmi = data.weight_kg && data.height_cm 
        ? (parseFloat(data.weight_kg) / Math.pow(parseFloat(data.height_cm) / 100, 2)).toFixed(1)
        : null;

    // Calculate NEWS score (simplified version)
    const calculateNewsScore = () => {
        let score = 0;
        
        // Temperature
        if (data.temperature_c) {
            const temp = parseFloat(data.temperature_c);
            if (temp <= 35.0) score += 3;
            else if (temp >= 39.1) score += 3;
            else if (temp >= 38.1) score += 2;
            else if (temp >= 36.1 && temp <= 38.0) score += 0;
            else if (temp >= 35.1 && temp <= 36.0) score += 1;
        }

        // Pulse
        if (data.pulse) {
            const pulse = parseInt(data.pulse);
            if (pulse <= 40) score += 3;
            else if (pulse >= 131) score += 3;
            else if (pulse >= 111) score += 2;
            else if (pulse >= 91) score += 1;
            else if (pulse >= 51 && pulse <= 90) score += 0;
            else if (pulse >= 41 && pulse <= 50) score += 1;
        }

        // Systolic BP
        if (data.blood_pressure) {
            const systolic = parseInt(data.blood_pressure.split('/')[0]);
            if (systolic <= 90) score += 3;
            else if (systolic >= 220) score += 3;
            else if (systolic >= 181) score += 2;
            else if (systolic >= 141) score += 1;
            else if (systolic >= 91 && systolic <= 140) score += 0;
        }

        // Oxygen Saturation
        if (data.oxygen_saturation) {
            const spo2 = parseFloat(data.oxygen_saturation);
            if (spo2 <= 91) score += 3;
            else if (spo2 >= 92 && spo2 <= 93) score += 2;
            else if (spo2 >= 94 && spo2 <= 95) score += 1;
            else if (spo2 >= 96) score += 0;
        }

        // Respiratory Rate
        if (data.respiratory_rate) {
            const rr = parseInt(data.respiratory_rate);
            if (rr <= 8) score += 3;
            else if (rr >= 25) score += 3;
            else if (rr >= 21) score += 2;
            else if (rr >= 12 && rr <= 20) score += 0;
            else if (rr >= 9 && rr <= 11) score += 1;
        }

        return score;
    };

    const newsScore = calculateNewsScore();
    const getNewsSeverity = (score: number) => {
        if (score >= 7) return { label: 'High Risk', variant: 'destructive' as const };
        if (score >= 5) return { label: 'Medium Risk', variant: 'secondary' as const };
        if (score >= 3) return { label: 'Low Risk', variant: 'outline' as const };
        return { label: 'Normal', variant: 'outline' as const };
    };

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

                {/* NEWS Score Display */}
                {(newsScore > 0 || data.temperature_c || data.pulse || data.respiratory_rate || data.oxygen_saturation) && (
                    <Card className={`border-l-4 ${newsScore >= 7 ? 'border-l-red-500' : newsScore >= 5 ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className={`h-5 w-5 ${newsScore >= 7 ? 'text-red-600' : newsScore >= 5 ? 'text-yellow-600' : 'text-green-600'}`} />
                                    <div>
                                        <p className="font-semibold">NEWS Score</p>
                                        <p className="text-sm text-muted-foreground">National Early Warning Score</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold">{newsScore}</p>
                                    <Badge variant={getNewsSeverity(newsScore).variant}>
                                        {getNewsSeverity(newsScore).label}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                        <Label htmlFor="blood_pressure">Blood Pressure (mmHg)</Label>
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

                            {/* Oxygen Saturation */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Gauge className="h-5 w-5" />
                                    Oxygen Saturation
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="oxygen_saturation">SpO2 (%)</Label>
                                        <Input
                                            id="oxygen_saturation"
                                            type="number"
                                            step="0.1"
                                            value={data.oxygen_saturation}
                                            onChange={(e) => setData('oxygen_saturation', e.target.value)}
                                            placeholder="98"
                                        />
                                        <InputError message={errors.oxygen_saturation} />
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
                                    {bmi && (
                                        <div className="space-y-2">
                                            <Label>BMI (Calculated)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input value={bmi} readOnly className="bg-muted" />
                                                <Badge variant="outline">{bmi}</Badge>
                                            </div>
                                        </div>
                                    )}
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

                            {/* Pain Score */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Pain Score
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="pain_score">Pain Score (0-10)</Label>
                                        <Input
                                            id="pain_score"
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={data.pain_score}
                                            onChange={(e) => setData('pain_score', e.target.value)}
                                            placeholder="0"
                                        />
                                        <InputError message={errors.pain_score} />
                                        <p className="text-xs text-muted-foreground">0 = No pain, 10 = Worst possible pain</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chief Complaint */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Clipboard className="h-5 w-5" />
                                    Chief Complaint
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="chief_complaint">Chief Complaint</Label>
                                    <textarea
                                        id="chief_complaint"
                                        value={data.chief_complaint}
                                        onChange={(e) => setData('chief_complaint', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Patient's primary reason for visit"
                                    />
                                    <InputError message={errors.chief_complaint} />
                                </div>
                            </div>

                            {/* Nurse Notes */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Clipboard className="h-5 w-5" />
                                    Nurse Notes
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="nurse_notes">Nurse Notes</Label>
                                    <textarea
                                        id="nurse_notes"
                                        value={data.nurse_notes}
                                        onChange={(e) => setData('nurse_notes', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Additional observations and notes"
                                    />
                                    <InputError message={errors.nurse_notes} />
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
