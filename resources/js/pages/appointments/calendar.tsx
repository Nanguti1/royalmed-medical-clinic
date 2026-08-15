import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Appointment } from '@/types/appointment';

type PageProps = {
    appointments: Appointment[];
    view: string;
    date: string;
};

export default function AppointmentCalendar() {
    const { appointments, view, date } = usePage<PageProps>().props;
    const [currentView, setCurrentView] = useState(view);
    const [currentDate, setCurrentDate] = useState(date);

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        window.location.href = `/appointments/calendar?view=${currentView}&date=${newDate}`;
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        handleDateChange(newDate.toISOString().split('T')[0]);
    };

    const handleViewChange = (newView: string) => {
        setCurrentView(newView);
        window.location.href = `/appointments/calendar?view=${newView}&date=${currentDate}`;
    };

    const getAppointmentsForDate = (date: string) => {
        return appointments.filter((apt) => apt.appointment_date === date);
    };

    const daysInMonth = new Date(currentDate).getDate();

    return (
        <>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                        <p className="text text-muted-foreground">
                            View and manage appointments by date.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/appointments">
                                List View
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/appointments/create">
                                New Appointment
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Controls */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => changeDate(-7)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="font-medium">{new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                <Button variant="outline" size="icon" onClick={() => changeDate(7)}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={currentView}
                                    onValueChange={(value) => handleViewChange(value)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month">Month</SelectItem>
                                        <SelectItem value="week">Week</SelectItem>
                                        <SelectItem value="day">Day</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    value={currentDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="w-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar View */}
                {currentView === 'month' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Month View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="font-medium text-center text-muted-foreground">{day}</div>
                                ))}
                                {Array.from({ length: 35 }, (_, i) => {
                                    const day = i + 1;
                                    const dateStr = new Date(currentDate.getFullYear(), new Date(currentDate).getMonth(), day).toISOString().split('T')[0];
                                    const dayAppointments = getAppointmentsForDate(dateStr);
                                    const isCurrentMonth = new Date(currentDate).getMonth() === new Date(dateStr).getMonth();

                                    return (
                                        <div
                                            key={i}
                                            className={`p-2 border rounded min-h-24 ${
                                                isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                                            }`}
                                        >
                                            <div className="text-sm font-medium mb-1">{day}</div>
                                            {dayAppointments.map((apt) => (
                                                <div
                                                    key={apt.id}
                                                    className="text-xs p-1 rounded bg-primary/10 text-primary-foreground cursor-pointer mb-1"
                                                    onClick={() => (window.location.href = `/appointments/${apt.id}`)}
                                                >
                                                    <div className="font-medium truncate">{apt.start_time}</div>
                                                    <div className="truncate">{apt.patient?.first_name} {apt.patient?.last_name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentView === 'week' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Week View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 7 }, (_, i) => {
                                    const date = new Date(currentDate);
                                    date.setDate(date.getDate() - date.getDay() + i);
                                    const dateStr = date.toISOString().split('T')[0];
                                    const dayAppointments = getAppointmentsForDate(dateStr);

                                    return (
                                        <div key={i} className="border rounded p-2 min-h-64">
                                            <div className="font-medium text-center mb-2">
                                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            {dayAppointments.map((apt) => (
                                                <div
                                                    key={apt.id}
                                                    className="text-xs p-2 rounded bg-primary/10 text-primary-foreground cursor-pointer mb-2"
                                                    onClick={() => (window.location.href = `/appointments/${apt.id}`)}
                                                >
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="font-medium">{apt.start_time}</span>
                                                    </div>
                                                    <div className="font-medium truncate">{apt.patient?.first_name} {apt.patient?.last_name}</div>
                                                    {apt.doctor && (
                                                        <div className="text-muted-foreground truncate">
                                                            Dr. {apt.doctor.first_name}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentView === 'day' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Day View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {getAppointmentsForDate(currentDate).map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="p-4 border rounded cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => (window.location.href = `/appointments/${apt.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium">
                                                    {apt.patient?.first_name} {apt.patient?.last_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{apt.patient?.hospital_number}</p>
                                            </div>
                                            <Badge>{apt.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{apt.start_time} - {apt.end_time}</span>
                                            </div>
                                            {apt.doctor && (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Dr. {apt.doctor.first_name} {apt.doctor.last_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        {apt.reason && <p className="text-sm">{apt.reason}</p>}
                                    </div>
                                ))}
                                {getAppointmentsForDate(currentDate).length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">No appointments scheduled for this day.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
