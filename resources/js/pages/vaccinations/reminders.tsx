import { Head, useForm, usePage } from '@inertiajs/react';
import { Bell, Clock, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VaccinationReminder } from '@/types/vaccination';

type PageProps = {
    reminders: {
        data: VaccinationReminder[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
    };
};

export default function VaccinationReminders() {
    const { reminders, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        status: filters.status || 'pending',
    });

    const handleFilter = (value: string) => {
        setData('status', value);
        get('/vaccinations/reminders', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'sent':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Vaccination Reminders" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Vaccination Reminders</h1>
                        <p className="text-muted-foreground">Manage vaccination reminders for patients.</p>
                    </div>
                    <Button asChild>
                        <a href="/vaccinations">
                            <Bell className="mr-2 h-4 w-4" />
                            Back to Vaccinations
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            <Select
                                value={data.status}
                                onValueChange={handleFilter}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {reminders.data.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No reminders found</h3>
                        <p className="text-muted-foreground">No reminders with the selected status.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {reminders.data.map((reminder) => (
                                <ReminderCard key={reminder.id} reminder={reminder} getStatusColor={getStatusColor} />
                            ))}
                        </div>
                        {reminders.links && reminders.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {reminders.links.map((link: any, index: number) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function ReminderCard({ reminder, getStatusColor }: { reminder: VaccinationReminder; getStatusColor: (status: string) => string }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {reminder.patient?.first_name} {reminder.patient?.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{reminder.patient?.hospital_number}</p>
                    </div>
                    <Badge className={getStatusColor(reminder.status)}>
                        {reminder.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Scheduled: {new Date(reminder.scheduled_date).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground">Type: {reminder.reminder_type}</p>
                    <p className="text-muted-foreground">{reminder.message}</p>
                    {reminder.vaccinationRecord?.vaccine && (
                        <p className="text-muted-foreground">Vaccine: {reminder.vaccinationRecord.vaccine.name}</p>
                    )}
                    {reminder.sent_at && (
                        <p className="text-muted-foreground">Sent: {new Date(reminder.sent_at).toLocaleString()}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
