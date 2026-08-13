import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Pill, FileText, User, Calendar } from 'lucide-react';
import type { Prescription } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    prescriptions: {
        data: Prescription[];
        links: any;
        meta: any;
    };
};

export default function PharmacyIndex() {
    const { prescriptions } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Pharmacy" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
                        <p className="text-muted-foreground">
                            Pending prescriptions for dispensing
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGuard permission="inventory.view" fallback={null}>
                            <Button variant="outline" asChild>
                                <a href="/pharmacy/inventory">
                                    <Pill className="mr-2 h-4 w-4" />
                                    Inventory
                                </a>
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="inventory.manage" fallback={null}>
                            <Button variant="outline" asChild>
                                <a href="/pharmacy/receive">
                                    <Pill className="mr-2 h-4 w-4" />
                                    Receive Stock
                                </a>
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Prescriptions List */}
                {prescriptions.data.length === 0 ? (
                    <EmptyState
                        icon={Pill}
                        title="No pending prescriptions"
                        description="There are no prescriptions waiting to be dispensed."
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {prescriptions.data.map((prescription) => (
                                <PrescriptionCard key={prescription.id} prescription={prescription} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {prescriptions.links && prescriptions.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {prescriptions.links.map((link: any, index: number) => (
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

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
    const patientName = prescription.visit?.patient
        ? [prescription.visit.patient.first_name, prescription.visit.patient.other_names, prescription.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const date = new Date(prescription.created_at).toLocaleDateString();
    const itemCount = prescription.items?.length || 0;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{patientName}</h3>
                            <p className="text-sm text-muted-foreground">
                                Prescription #{prescription.id} • {date} • {itemCount} item(s)
                            </p>
                        </div>
                    </div>
                    <PermissionGuard permission="pharmacy.dispense" fallback={null}>
                        <Button asChild>
                            <a href={`/pharmacy/dispense/${prescription.id}`}>
                                <Pill className="mr-2 h-4 w-4" />
                                Dispense
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>
            </CardContent>
        </Card>
    );
}
