import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, FileText, Heart, User } from 'lucide-react';
import type { Visit } from '@/types/visit';

type PageProps = {
    visit: Visit;
};

export default function ConsultationCreate() {
    const { visit } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        visit_id: visit.id,
        provider_id: '',
        chief_complaint: '',
        history: '',
        examination: '',
        plan: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/consultations');
    };

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const hasVitals = visit.vitalSign !== null;

    return (
        <>
            <Head title="Start Consultation" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/consultations">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Start Consultation</h1>
                        <p className="text-muted-foreground">
                            Consultation for {patientName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Patient Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <p className="font-medium">{patientName}</p>
                            </div>
                            {visit.patient?.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{visit.patient.phone}</p>
                                </div>
                            )}
                            {visit.patient?.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{visit.patient.email}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vitals Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Vitals Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hasVitals && visit.vitalSign ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temperature</p>
                                        <p className="font-medium">{visit.vitalSign.temperature_c || 'N/A'} °C</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                        <p className="font-medium">{visit.vitalSign.blood_pressure || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pulse</p>
                                        <p className="font-medium">{visit.vitalSign.pulse || 'N/A'} bpm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{visit.vitalSign.weight_kg || 'N/A'} kg</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">No vitals recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Consultation Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Clinical Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="space-y-2">
                                    <Label htmlFor="chief_complaint">Chief Complaint</Label>
                                    <textarea
                                        id="chief_complaint"
                                        value={data.chief_complaint}
                                        onChange={(e) => setData('chief_complaint', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe the patient's chief complaint..."
                                    />
                                    <InputError message={errors.chief_complaint} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="history">History</Label>
                                    <textarea
                                        id="history"
                                        value={data.history}
                                        onChange={(e) => setData('history', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Patient medical history..."
                                    />
                                    <InputError message={errors.history} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="examination">Examination</Label>
                                    <textarea
                                        id="examination"
                                        value={data.examination}
                                        onChange={(e) => setData('examination', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Physical examination findings..."
                                    />
                                    <InputError message={errors.examination} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan">Plan</Label>
                                    <textarea
                                        id="plan"
                                        value={data.plan}
                                        onChange={(e) => setData('plan', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Treatment plan..."
                                    />
                                    <InputError message={errors.plan} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Any additional notes..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href="/consultations">Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Starting...' : 'Start Consultation'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
