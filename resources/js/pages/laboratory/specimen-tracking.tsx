import { Head, usePage } from '@inertiajs/react';
import { FlaskConical, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Specimen } from '@/types/laboratory';

type PageProps = {
    specimens: Specimen[];
};

export default function SpecimenTracking() {
    const { specimens } = usePage<PageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'received':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'collected':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'processing':
                return <FlaskConical className="h-4 w-4" />;
            case 'received':
                return <ArrowRight className="h-4 w-4" />;
            case 'collected':
                return <Clock className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Head title="Specimen Tracking" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Specimen Tracking</h1>
                        <p className="text-muted-foreground">Track specimen lifecycle from collection to results.</p>
                    </div>
                </div>

                {specimens.length === 0 ? (
                    <EmptyState
                        icon={FlaskConical}
                        title="No specimens found"
                        description="No specimens have been tracked."
                    />
                ) : (
                    <div className="grid gap-4">
                        {specimens.map((specimen) => (
                            <Card key={specimen.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{specimen.specimen_number}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{specimen.test_type}</p>
                                        </div>
                                        <Badge className={getStatusColor(specimen.status)}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(specimen.status)}
                                                {specimen.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </div>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Collection Date:</span>
                                                <span className="font-medium">{new Date(specimen.collection_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Collection Time:</span>
                                                <span className="font-medium">{specimen.collection_time}</span>
                                            </div>
                                            {specimen.collector && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Collected By:</span>
                                                    <span className="font-medium">{specimen.collector.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {specimen.patient && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Patient:</span>
                                                    <span className="font-medium">{specimen.patient.first_name} {specimen.patient.last_name}</span>
                                                </div>
                                            )}
                                            {specimen.received_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Received:</span>
                                                    <span className="font-medium">{new Date(specimen.received_date).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {specimen.processing_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Processing:</span>
                                                    <span className="font-medium">{new Date(specimen.processing_date).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {specimen.result_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Result Date:</span>
                                                    <span className="font-medium">{new Date(specimen.result_date).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className={`w-3 h-3 rounded-full ${specimen.status === 'collected' || specimen.status === 'received' || specimen.status === 'processing' || specimen.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>Collected</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <div className={`w-3 h-3 rounded-full ${specimen.status === 'received' || specimen.status === 'processing' || specimen.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>Received</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <div className={`w-3 h-3 rounded-full ${specimen.status === 'processing' || specimen.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>Processing</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <div className={`w-3 h-3 rounded-full ${specimen.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>Completed</span>
                                        </div>
                                    </div>

                                    {specimen.notes && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">{specimen.notes}</p>
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
