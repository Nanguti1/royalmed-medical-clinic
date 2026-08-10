import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Pill, User } from 'lucide-react';
import type { Prescription } from '@/types/visit';

type PageProps = {
    prescription: Prescription;
};

export default function PrescriptionShow() {
    const { prescription } = usePage<PageProps>().props;

    const patientName = prescription.visit?.patient
        ? [prescription.visit.patient.first_name, prescription.visit.patient.other_names, prescription.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const isDraft = prescription.finalized_at === null;
    const isDispensed = prescription.dispensed_at !== null;

    return (
        <>
            <Head title={`Prescription #${prescription.id} - ${patientName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={`/consultations`}>
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Prescription #{prescription.id}</h1>
                            <p className="text-muted-foreground">
                                {patientName} • Visit #{prescription.visit_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isDraft && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Draft
                            </Badge>
                        )}
                        {!isDraft && !isDispensed && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Finalized
                            </Badge>
                        )}
                        {isDispensed && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Dispensed
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Patient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient Name</p>
                                <Link
                                    href={`/patients/${prescription.visit?.patient?.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {patientName}
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visit ID</p>
                                <p className="font-medium">#{prescription.visit_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Prescription Date</p>
                                <p className="font-medium">{new Date(prescription.created_at).toLocaleDateString()}</p>
                            </div>
                            {prescription.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="font-medium">{prescription.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Prescription Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Prescription Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {prescription.items && prescription.items.length > 0 ? (
                                <div className="space-y-4">
                                    {prescription.items.map((item) => (
                                        <Card key={item.id} className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{item.medicine?.name}</h4>
                                                    {item.medicine?.generic_name && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.medicine.generic_name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="grid gap-2 text-sm md:grid-cols-2">
                                                {item.dosageUnit && (
                                                    <div>
                                                        <span className="text-muted-foreground">Dosage: </span>
                                                        {item.dosageUnit.name}
                                                    </div>
                                                )}
                                                {item.frequency && (
                                                    <div>
                                                        <span className="text-muted-foreground">Frequency: </span>
                                                        {item.frequency.name}
                                                        {item.frequency.times_per_day && ` (${item.frequency.times_per_day}x/day)`}
                                                    </div>
                                                )}
                                                {item.route && (
                                                    <div>
                                                        <span className="text-muted-foreground">Route: </span>
                                                        {item.route.name}
                                                    </div>
                                                )}
                                                {item.duration_unit && item.duration_quantity && (
                                                    <div>
                                                        <span className="text-muted-foreground">Duration: </span>
                                                        {item.duration_quantity} {item.duration_unit.name}
                                                    </div>
                                                )}
                                                {item.instructions && (
                                                    <div className="md:col-span-2">
                                                        <span className="text-muted-foreground">Instructions: </span>
                                                        {item.instructions}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No prescription items.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
