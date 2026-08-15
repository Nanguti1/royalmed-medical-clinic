import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type PageProps = {
    appointment: {
        id: number;
        patient_id: number;
        doctor_id: number | null;
        dental_chair_id: number | null;
        appointment_date: string;
        start_time: string;
        end_time: string;
        appointment_type: string;
        reason: string | null;
        notes: string | null;
        status: string;
        is_walk_in: boolean;
        is_follow_up: boolean;
        schedule_reminder: boolean;
        reminder_type: string | null;
    };
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
};

export default function AppointmentEdit() {
    const { appointment, patients, doctors, dentalChairs } = usePage<PageProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        doctor_id: appointment.doctor_id?.toString() || '',
        dental_chair_id: appointment.dental_chair_id?.toString() || '',
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        appointment_type: appointment.appointment_type,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status,
        is_walk_in: appointment.is_walk_in,
        is_follow_up: appointment.is_follow_up,
        schedule_reminder: appointment.schedule_reminder,
        reminder_type: appointment.reminder_type || 'email',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/appointments/${appointment.id}`, {
            onSuccess: () => {
                window.location.href = `/appointments/${appointment.id}`;
            },
        });
    };

    return (
        <>
            <Head title="Edit Appointment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/appointments/${appointment.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
                        <p className="text-muted-foreground">
                            Update appointment details for {appointment.patient?.first_name} {appointment.patient?.last_name}.
                        </p>
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
                                            <SelectItem value="walk_in">Walk-in</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.appointment_type && <p className="text-sm text-red-500">{errors.appointment_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="no_show">No Show</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <a href={`/appointments/${appointment.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
