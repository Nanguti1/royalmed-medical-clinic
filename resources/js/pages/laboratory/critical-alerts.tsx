import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { CriticalAlert } from '@/types/laboratory';

type PageProps = {
    alerts: CriticalAlert[];
};

export default function CriticalAlerts() {
    const { alerts } = usePage<PageProps>().props;

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'panic':
                return 'bg-red-600 text-white border-red-700';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'abnormal':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Critical Alerts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Critical Alerts</h1>
                        <p className="text-muted-foreground">Urgent and critical laboratory results requiring immediate attention.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium text-red-600">{alerts.length} Active Alerts</span>
                    </div>
                </div>

                {alerts.length === 0 ? (
                    <EmptyState
                        icon={CheckCircle}
                        title="No critical alerts"
                        description="All laboratory results are within normal ranges."
                    />
                ) : (
                    <div className="grid gap-4">
                        {alerts.map((alert) => (
                            <Card key={alert.id} className="border-red-200">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                                {alert.test_name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">{alert.lab_order?.order_number}</p>
                                        </div>
                                        <Badge className={getUrgencyColor(alert.urgency)}>
                                            {alert.urgency.toUpperCase()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Result:</span>
                                                <span className="font-bold text-red-600">{alert.result_value}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Reference Range:</span>
                                                <span className="font-medium">{alert.reference_range}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Alerted At:</span>
                                                <span className="font-medium">{new Date(alert.alerted_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {alert.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{alert.patient.first_name} {alert.patient.last_name}</span>
                                                </div>
                                            )}
                                            {alert.acknowledger ? (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Acknowledged By:</span>
                                                    <span className="font-medium">{alert.acknowledger.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <span className="font-medium text-red-600">Not Acknowledged</span>
                                                </div>
                                            )}
                                            {alert.acknowledged_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Acknowledged At:</span>
                                                    <span className="font-medium">{new Date(alert.acknowledged_at).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {alert.notes && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">{alert.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
