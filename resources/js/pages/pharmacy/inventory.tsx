import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pill, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Medicine } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    medicines: Medicine[];
};

export default function PharmacyInventory() {
    const { medicines } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Inventory" />
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
                            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                            <p className="text-muted-foreground">
                                Medicine stock levels and status
                            </p>
                        </div>
                    </div>
                    <PermissionGuard permission="inventory.manage" fallback={null}>
                        <Button asChild>
                            <a href="/pharmacy/receive">
                                <Pill className="mr-2 h-4 w-4" />
                                Receive Stock
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Inventory Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Medicine Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Medicine</th>
                                        <th className="text-left p-3">Stock</th>
                                        <th className="text-left p-3">Reorder Level</th>
                                        <th className="text-left p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.map((medicine) => (
                                        <tr key={medicine.id} className="border-b">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">{medicine.name}</p>
                                                    {medicine.generic_name && (
                                                        <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">{medicine.total_stock || 0}</td>
                                            <td className="p-3">{medicine.reorder_level || 0}</td>
                                            <td className="p-3">
                                                {medicine.has_expired ? (
                                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        <AlertTriangle className="mr-1 h-3 w-3" />
                                                        Expired
                                                    </Badge>
                                                ) : medicine.is_low_stock ? (
                                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                        <AlertTriangle className="mr-1 h-3 w-3" />
                                                        Low Stock
                                                    </Badge>
                                                ) : medicine.expiring_soon ? (
                                                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        Expiring Soon
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        OK
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
