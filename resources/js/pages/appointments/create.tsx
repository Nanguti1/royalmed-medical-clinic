import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type PageProps = {
    patients: Array<{
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    }>;
    doctors: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
    dentalChairs: Array<{
        id: number;
        chair_name: string;
    }>;
    defaults: {
        patient_id?: number;
        visit_id?: number;
        consultation_id?: number;
        appointment_type?: string;
    };
};

export default function AppointmentCreate() {
    const { patients, doctors, dentalChairs, defaults } = usePage<PageProps>().props;
    
    const { data, setData, post, processing, errors } = useForm({
        patient_id: defaults.patient_id,
        doctor_id: '',
        dental_chair_id: '',
        visit_id: defaults.visit_id,
        consultation_id: defaults.consultation_id,
        appointment_date: '',
        start_time: '',
        end_time: '',
        appointment_type: defaults.appointment_type || 'consultation',
        reason: '',
        notes: '',
        is_walk_in: false,
        is_follow_up: false,
        schedule_reminder: true,
        reminder_type: 'email',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/appointments', {
            onSuccess: () => {
                window.location.href = '/appointments';
            },
        });
    };

    return (
        <>
            <Head title="New Appointment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/appointments">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
                        <p className="text-muted-foreground">Schedule a new appointment for a patient.</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <Select
                                        value={data.patient_id?.toString()}
                                        onValueChange={(value) => setData('patient_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                                    {patient.first_name} {patient.last_name} ({patient.hospital_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="doctor_id">Doctor</Label>
                                    <Select
                                        value={data.doctor_id}
                                        onValueChange={(value) => setData('doctor_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No doctor assigned</SelectItem>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    Dr. {doctor.first_name} {doctor.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dental_chair_id">Dental Chair</Label>
                                    <Select
                                        value={data.dental_chair_id}
                                        onValueChange={(value) => setData('dental_chair_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select dental chair" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No chair assigned</SelectItem>
                                            {dentalChairs.map((chair) => (
                                                <SelectItem key={chair.id} value={chair.id.toString()}>
                                                    {chair.chair_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                                    <Select
                                        value={data.appointment_type}
                                        onValueChange={(value) => setData('appointment_type', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consultation">Consultation</SelectItem>
                                            <SelectItem value="procedure">Procedure</SelectItem>
                                            <SelectItem value="follow_up">Follow-up</SelectItem>
                                            <SelectItem value="dental">Dental</SelectItem>
                                            <SelectItem value="laboratory">Laboratory</SelectItem>
                                            <SelectItem value="walk_in">Walk-in</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.appointment_type && <p className="text-sm text-red-500">{errors.appointment_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="appointment_date">Date *</Label>
                                    <Input
                                        id="appointment_date"
                                        type="date"
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                    />
                                    {errors.appointment_date && <p className="text-sm text-red-500">{errors.appointment_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time *</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Reason for appointment"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes"
                                />
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_walk_in"
                                        checked={data.is_walk_in}
                                        onCheckedChange={(checked) => setData('is_walk_in', checked as boolean)}
                                    />
                                    <Label htmlFor="is_walk_in" className="cursor-pointer">Walk-in</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_follow_up"
                                        checked={data.is_follow_up}
                                        onCheckedChange={(checked) => setData('is_follow_up', checked as boolean)}
                                    />
                                    <Label htmlFor="is_follow_up" className="cursor-pointer">Follow-up</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="schedule_reminder"
                                        checked={data.schedule_reminder}
                                        onCheckedChange={(checked) => setData('schedule_reminder', checked as boolean)}
                                    />
                                    <Label htmlFor="schedule_reminder" className="cursor-pointer">Schedule Reminder</Label>
                                </div>

                                {data.schedule_reminder && (
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="reminder_type">Reminder Type:</Label>
                                        <Select
                                            value={data.reminder_type}
                                            onValueChange={(value) => setData('reminder_type', value as any)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/appointments">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Appointment'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
