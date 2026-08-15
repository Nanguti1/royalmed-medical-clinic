import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClinicalTimelineComponent from '@/components/clinical-timeline';
import type { Patient, TimelineEvent } from '@/types/patient';
import { useState } from 'react';

type PageProps = {
    patient: Patient;
    timelineEvents: TimelineEvent[];
};

export default function PatientClinicalTimeline() {
    const { patient, timelineEvents } = usePage<PageProps>().props;
    const [filterType, setFilterType] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');

    const fullName = [patient.first_name, patient.other_names, patient.last_name]
        .filter(Boolean)
        .join(' ');

    const filteredEvents = timelineEvents.filter(event => {
        if (filterType !== 'all' && event.type !== filterType) return false;
        if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
        return true;
    });

    const eventTypes = ['all', 'visit', 'consultation', 'prescription', 'lab_result', 'vaccination', 'allergy', 'condition', 'procedure', 'document', 'alert'];
    const severityLevels = ['all', 'low', 'medium', 'high', 'critical'];

    return (
        <>
            <Head title={`Clinical Timeline - ${fullName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clinical Timeline</h1>
                        <p className="text-muted-foreground">
                            Longitudinal clinical history for {fullName}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Event Type</label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventTypes.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Severity</label>
                                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {severityLevels.map(level => (
                                            <SelectItem key={level} value={level}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="secondary">
                                {filteredEvents.length} of {timelineEvents.length} events
                            </Badge>
                            {(filterType !== 'all' || filterSeverity !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFilterType('all');
                                        setFilterSeverity('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <ClinicalTimelineComponent
                    events={filteredEvents}
                    title="Clinical History"
                    maxEvents={50}
                />
            </div>
        </>
    );
}