import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Pill, User, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Prescription } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    prescription: Prescription;
};

export default function PharmacyDispense() {
    const { prescription } = usePage<PageProps>().props;

    const { post, processing, errors } = useForm({});

    const patientName = prescription.visit?.patient
        ? [prescription.visit.patient.first_name, prescription.visit.patient.other_names, prescription.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const handleDispense = () => {
        post(`/pharmacy/dispense/${prescription.id}`);
    };

    const getStockStatus = (medicine: any) => {
        const availableStock = medicine.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0;
        const requiredQuantity = prescription.items?.find((item) => item.medicine_id === medicine.id)?.quantity || 0;

        if (availableStock < requiredQuantity) {
            return { status: 'insufficient', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', message: 'Insufficient' };
        }
        if (availableStock === requiredQuantity) {
            return { status: 'exact', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', message: 'Exact' };
        }
        return { status: 'available', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', message: 'Available' };
    };

    const canDispense = prescription.items?.every((item) => {
        const medicine = item.medicine;
        if (!medicine) return false;
        const availableStock = medicine.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0;
        return availableStock >= item.quantity;
    });

    return (
        <>
            <Head title={`Dispense Prescription #${prescription.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/pharmacy">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Dispense Prescription #{prescription.id}</h1>
                            <p className="text-muted-foreground">
                                {patientName} • Visit #{prescription.visit_id}
                            </p>
                        </div>
                    </div>
                    <PermissionGuard permission="pharmacy.dispense" fallback={null}>
                        <Button onClick={handleDispense} disabled={processing || !canDispense}>
                            <Pill className="mr-2 h-4 w-4" />
                            {processing ? 'Dispensing...' : 'Dispense Prescription'}
                        </Button>
                    </PermissionGuard>
                </div>

                <AlertError errors={errors} />

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
                                <p className="font-medium">{patientName}</p>
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
                                    {prescription.items.map((item) => {
                                        const medicine = item.medicine;
                                        if (!medicine) return null;

                                        const availableStock = medicine.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0;
                                        const stockStatus = getStockStatus(medicine);

                                        return (
                                            <Card key={item.id} className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">{medicine.name}</h4>
                                                        {medicine.generic_name && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {medicine.generic_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge className={stockStatus.color}>
                                                        {stockStatus.message}
                                                    </Badge>
                                                </div>
                                                <div className="grid gap-2 text-sm md:grid-cols-2">
                                                    <div>
                                                        <span className="text-muted-foreground">Required: </span>
                                                        {item.quantity}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Available: </span>
                                                        {availableStock}
                                                    </div>
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
                                                {medicine.batches && medicine.batches.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-xs text-muted-foreground mb-2">Available Batches (FEFO order):</p>
                                                        <div className="space-y-1">
                                                            {medicine.batches.map((batch: any) => (
                                                                <div key={batch.id} className="text-xs flex justify-between">
                                                                    <span>{batch.batch_number}</span>
                                                                    <span>
                                                                        Qty: {batch.quantity} • Exp: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No prescription items.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {!canDispense && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="font-medium">Cannot dispense: Insufficient stock for one or more medicines.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
