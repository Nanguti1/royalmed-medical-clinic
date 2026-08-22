import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Play, RefreshCw, Stethoscope, User, FlaskConical } from 'lucide-react';
import type { QueueEntry } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    entries: QueueEntry[];
};

export default function ConsultationIndex() {
    const { entries } = usePage<PageProps>().props;

    const handleRefresh = () => {
        router.reload();
    };

    const handleStartConsultation = (visitId: number) => {
        router.post(`/consultations/visits/${visitId}/start`, {}, {
            onSuccess: () => {
                router.reload();
            },
            onError: (errors) => {
                console.error('Error starting consultation:', errors);
            },
        });
    };

    const handleContinueConsultation = (consultationId: number) => {
        router.visit(`/consultations/${consultationId}`);
    };

    return (
        <>
            <Head title="Clinician Desk" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clinician Desk</h1>
                        <p className="text-muted-foreground">
                            Patients waiting for consultation
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="/visits/queue">
                                <Stethoscope className="mr-2 h-4 w-4" />
                                Queue
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Queue List */}
                {entries.length === 0 ? (
                    <EmptyState
                        icon={User}
                        title="No patients waiting"
                        description="There are no patients currently waiting for consultation."
                    />
                ) : (
                    <div className="grid gap-4">
                        {entries.map((entry) => (
                            <QueueCard
                                key={entry.id}
                                entry={entry}
                                onStartConsultation={handleStartConsultation}
                                onContinueConsultation={handleContinueConsultation}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function QueueCard({ entry, onStartConsultation, onContinueConsultation }: { entry: QueueEntry; onStartConsultation: (visitId: number) => void; onContinueConsultation: (consultationId: number) => void }) {
    const patientName = entry.visit?.patient
        ? [entry.visit.patient.first_name, entry.visit.patient.other_names, entry.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const arrivalTime = new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const hasVitals = entry.visit?.vitalSign !== null;

    const isLabReturn = entry.metadata?.action === 'continue_consultation';
    const consultationId = entry.metadata?.consultation_id;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'called':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in_progress':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-lg font-bold text-primary">{entry.position || '–'}</span>
                        </div>
                        <div>
                            <h3 className="font-semibold">{patientName}</h3>
                            <p className="text-sm text-muted-foreground">
                                Visit #{entry.visit_id} • Arrived {arrivalTime}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(entry.status)}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('_', ' ')}
                        </Badge>
                        {hasVitals && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Vitals Captured
                            </Badge>
                        )}
                        {isLabReturn && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                <FlaskConical className="mr-1 h-3 w-3" />
                                Lab Results Ready
                            </Badge>
                        )}
                        <PermissionGuard permission="consultations.create" fallback={null}>
                            {isLabReturn && consultationId ? (
                                <Button onClick={() => onContinueConsultation(consultationId)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Continue Consultation
                                </Button>
                            ) : (
                                <Button onClick={() => onStartConsultation(entry.visit_id)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Consultation
                                </Button>
                            )}
                        </PermissionGuard>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
