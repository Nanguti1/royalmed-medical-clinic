import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DentalChart, DentalTooth } from '@/types/dental';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    chart: DentalChart;
};

export default function DentalChartPage() {
    const { patient, chart } = usePage<PageProps>().props;

    const teethNumbers = Array.from({ length: 32 }, (_, i) => i + 1);
    const upperTeeth = teethNumbers.slice(0, 16);
    const lowerTeeth = teethNumbers.slice(16).reverse();

    const getTooth = (toothNumber: number) => {
        return chart.teeth?.find((t) => t.tooth_number === toothNumber);
    };

    const getToothStatusColor = (tooth: DentalTooth | undefined) => {
        if (!tooth) return 'bg-gray-100 border-gray-300';
        if (tooth.is_extracted) return 'bg-red-100 border-red-300';
        if (tooth.needs_treatment) return 'bg-yellow-100 border-yellow-300';
        if (tooth.is_crowned || tooth.is_filled) return 'bg-green-100 border-green-300';
        return 'bg-blue-100 border-blue-300';
    };

    return (
        <>
            <Head title={`Dental Chart - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Dental Chart</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                </div>

                {/* Odontogram */}
                <Card>
                    <CardHeader>
                        <CardTitle>Odontogram</CardTitle>
                        <p className="text-sm text-muted-foreground">Last examined: {chart.chart_date ? new Date(chart.chart_date).toLocaleDateString() : 'N/A'}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Upper Teeth */}
                            <div>
                                <p className="text-sm font-medium mb-3 text-center">Upper Arch</p>
                                <div className="flex justify-center gap-2">
                                    {upperTeeth.map((toothNumber) => {
                                        const tooth = getTooth(toothNumber);
                                        return (
                                            <ToothDisplay
                                                key={toothNumber}
                                                toothNumber={toothNumber}
                                                tooth={tooth}
                                                getStatusColor={getToothStatusColor}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Lower Teeth */}
                            <div>
                                <p className="text-sm font-medium mb-3 text-center">Lower Arch</p>
                                <div className="flex justify-center gap-2">
                                    {lowerTeeth.map((toothNumber) => {
                                        const tooth = getTooth(toothNumber);
                                        return (
                                            <ToothDisplay
                                                key={toothNumber}
                                                toothNumber={toothNumber}
                                                tooth={tooth}
                                                getStatusColor={getToothStatusColor}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
                                <span className="text-sm">Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                                <span className="text-sm">Filled/Crowned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
                                <span className="text-sm">Needs Treatment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                                <span className="text-sm">Extracted</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tooth Details */}
                {chart.teeth && chart.teeth.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tooth Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {chart.teeth.map((tooth) => (
                                    <ToothDetail key={tooth.id} tooth={tooth} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {chart.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Chart Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{chart.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function ToothDisplay({ toothNumber, tooth, getStatusColor }: { toothNumber: number; tooth: DentalTooth | undefined; getStatusColor: (tooth: DentalTooth | undefined) => string }) {
    return (
        <div
            className={`w-12 h-12 border-2 rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${getStatusColor(tooth)}`}
            title={tooth?.condition || 'Normal'}
        >
            <span className="font-bold text-sm">{toothNumber}</span>
        </div>
    );
}

function ToothDetail({ tooth }: { tooth: DentalTooth }) {
    return (
        <div className="p-4 border rounded space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Tooth #{tooth.tooth_number} - {tooth.tooth_name}</h3>
                {tooth.needs_treatment && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Needs Treatment
                    </Badge>
                )}
            </div>
            {tooth.condition && (
                <p className="text-sm text-muted-foreground">Condition: {tooth.condition}</p>
            )}
            {tooth.notes && (
                <p className="text-sm text-muted-foreground">{tooth.notes}</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs">
                {tooth.is_extracted && <Badge variant="destructive">Extracted</Badge>}
                {tooth.is_implanted && <Badge>Implanted</Badge>}
                {tooth.is_crowned && <Badge>Crowned</Badge>}
                {tooth.is_filled && <Badge>Filled</Badge>}
                {tooth.root_canal && <Badge>Root Canal</Badge>}
            </div>
        </div>
    );
}
