import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Calendar, Clock, User, FileText } from 'lucide-react';
import type { AppointmentFormData } from '@/types/portal';

type PageProps = {
    doctors: Array<{
        id: number;
        first_name: string;
        last_name: string;
        specialization: string | null;
    }>;
    availableSlots?: Array<{
        date: string;
        time: string;
    }>;
};

export default function BookAppointment() {
    const { doctors, availableSlots } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm<AppointmentFormData>({
        doctor_id: 0,
        appointment_date: '',
        appointment_time: '',
        reason: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portal/patient/appointments');
    };

    const formatDateDisplay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTimeDisplay = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <>
            <Head title="Book Appointment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/portal/patient/appointments">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
                        <p className="text-muted-foreground">
                            Schedule a new appointment with a doctor
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Booking Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Appointment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="doctor_id">Select Doctor *</Label>
                                        <select
                                            id="doctor_id"
                                            value={data.doctor_id}
                                            onChange={(e) => setData('doctor_id', parseInt(e.target.value))}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            required
                                        >
                                            <option value={0}>Select a doctor</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor.id} value={doctor.id}>
                                                    Dr. {doctor.first_name} {doctor.last_name}
                                                    {doctor.specialization && ` - ${doctor.specialization}`}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.doctor_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_date">Date *</Label>
                                        <Input
                                            id="appointment_date"
                                            type="date"
                                            value={data.appointment_date}
                                            onChange={(e) => setData('appointment_date', e.target.value)}
                                            min={getTodayDate()}
                                            required
                                        />
                                        <InputError message={errors.appointment_date} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_time">Time *</Label>
                                        <Input
                                            id="appointment_time"
                                            type="time"
                                            value={data.appointment_time}
                                            onChange={(e) => setData('appointment_time', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.appointment_time} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Visit *</Label>
                                    <Input
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="e.g., General checkup, Follow-up, Specific symptoms..."
                                        required
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Any additional information about your appointment..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Important:</strong> Please arrive 15 minutes before your scheduled appointment time. Bring your ID and any relevant medical records.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href="/portal/patient/appointments">Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Booking...' : 'Book Appointment'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Available Slots */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Available Slots
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableSlots && availableSlots.length > 0 ? (
                                <div className="space-y-4">
                                    {availableSlots.slice(0, 5).map((slot, index) => (
                                        <div
                                            key={`${slot.date}-${slot.time}-${index}`}
                                            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                            onClick={() => {
                                                setData('appointment_date', slot.date);
                                                setData('appointment_time', slot.time);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">{formatDateDisplay(slot.date)}</p>
                                                    <p className="text-sm text-muted-foreground">{formatTimeDisplay(slot.time)}</p>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    Select
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <a href="/portal/patient/appointments/slots">
                                            View All Slots
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">No available slots displayed</p>
                                    <p className="text-xs mt-1">Select a doctor and date to see available times</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}