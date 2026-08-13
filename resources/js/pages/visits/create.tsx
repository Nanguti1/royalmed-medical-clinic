import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import type { Patient } from '@/types/patient';

type PageProps = {
    patient?: Patient;
    patients: Patient[];
};

export default function VisitCreate() {
    const { patient, patients } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        patient_id: patient?.id || '',
        visit_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/visits');
    };

    const patientName = patient
        ? [patient.first_name, patient.other_names, patient.last_name].filter(Boolean).join(' ')
        : '';

    return (
        <>
            <Head title="Create Visit" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={patient ? `/patients/${patient.id}` : '/patients'}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Visit</h1>
                        <p className="text-muted-foreground">
                            {patientName ? `Visit for ${patientName}` : 'Register a new patient visit'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visit Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AlertError errors={errors} />

                            {/* Patient Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Patient
                                </h3>
                                {patient ? (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="font-medium">{patientName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            ID: {patient.id} {patient.phone && `• ${patient.phone}`}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="patient_id">Patient *</Label>
                                        <select
                                            id="patient_id"
                                            value={data.patient_id}
                                            onChange={(e) => setData('patient_id', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select patient</option>
                                            {patients.map((patient) => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.first_name} {patient.other_names} {patient.last_name} - {patient.phone || 'No phone'}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.patient_id} />
                                        <p className="text-sm text-muted-foreground">
                                            Don't see the patient?{' '}
                                            <a href="/patients/create" className="text-primary hover:underline">
                                                Register new patient
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Visit Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Visit Details
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="visit_date">Visit Date</Label>
                                        <Input
                                            id="visit_date"
                                            type="date"
                                            value={data.visit_date}
                                            onChange={(e) => setData('visit_date', e.target.value)}
                                        />
                                        <InputError message={errors.visit_date} />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Additional Information
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href={patient ? `/patients/${patient.id}` : '/patients'}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Visit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
