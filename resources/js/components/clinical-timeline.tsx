import { Calendar, Clock, Stethoscope, Pill, FlaskConical, FileText, Heart, AlertTriangle, ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { TimelineEventType, TimelineEvent, ClinicalTimelineProps } from '@/types/patient';

const eventIcons: Record<TimelineEventType, LucideIcon> = {
    visit: Stethoscope,
    consultation: Stethoscope,
    prescription: Pill,
    lab_result: FlaskConical,
    vaccination: Heart,
    allergy: AlertTriangle,
    condition: Heart,
    procedure: Stethoscope,
    document: FileText,
    alert: AlertTriangle,
};

const eventColors: Record<TimelineEventType, string> = {
    visit: 'bg-blue-500',
    consultation: 'bg-blue-500',
    prescription: 'bg-green-500',
    lab_result: 'bg-purple-500',
    vaccination: 'bg-pink-500',
    allergy: 'bg-red-500',
    condition: 'bg-orange-500',
    procedure: 'bg-indigo-500',
    document: 'bg-gray-500',
    alert: 'bg-red-500',
};

const severityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ClinicalTimeline({
    events,
    title = 'Clinical Timeline',
    compact = false,
    maxEvents,
}: ClinicalTimelineProps) {
    const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
    const [showAll, setShowAll] = useState(false);

    const displayedEvents = showAll || !maxEvents 
        ? events 
        : events.slice(0, maxEvents);

    const toggleExpand = (eventId: number) => {
        setExpandedEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} weeks ago`;
        } else if (diffDays < 365) {
            return `${Math.floor(diffDays / 30)} months ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatFullDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No clinical events recorded.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <Badge variant="secondary">{events.length} events</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                    {/* Timeline events */}
                    <div className="space-y-6">
                        {displayedEvents.map((event, index) => {
                            const Icon = eventIcons[event.type];
                            const isExpanded = expandedEvents.has(event.id);
                            const showExpandButton = event.details && Object.keys(event.details).length > 0;

                            return (
                                <div key={event.id} className="relative pl-10">
                                    {/* Timeline dot */}
                                    <div className={`absolute left-2 top-0 w-5 h-5 rounded-full ${eventColors[event.type]} border-4 border-background`} />

                                    {/* Event content */}
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{event.title}</span>
                                                    {event.severity && (
                                                        <Badge 
                                                            variant="outline" 
                                                            className={severityColors[event.severity]}
                                                        >
                                                            {event.severity}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span title={formatFullDate(event.date)}>
                                                        {formatDate(event.date)}
                                                    </span>
                                                    {event.provider && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{event.provider}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {event.description && !compact && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expandable details */}
                                        {showExpandButton && !compact && (
                                            <div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExpand(event.id)}
                                                    className="h-8 gap-1"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronDown className="h-3 w-3" />
                                                            Hide Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronRight className="h-3 w-3" />
                                                            Show Details
                                                        </>
                                                    )}
                                                </Button>

                                                {isExpanded && event.details && (
                                                    <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                                                        {Object.entries(event.details).map(([key, value]) => (
                                                            <div key={key} className="grid grid-cols-2 gap-2 text-sm">
                                                                <span className="text-muted-foreground capitalize">
                                                                    {key.replace(/_/g, ' ')}:
                                                                </span>
                                                                <span className="font-medium">
                                                                    {typeof value === 'object' 
                                                                        ? JSON.stringify(value) 
                                                                        : String(value)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Show more button */}
                    {maxEvents && events.length > maxEvents && !showAll && (
                        <div className="mt-6 text-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAll(true)}
                            >
                                Show {events.length - maxEvents} More Events
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}