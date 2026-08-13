import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pill, Plus, AlertTriangle, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    medicines: {
        data: any[];
        links: any;
        meta: any;
    };
};

export default function MedicineIndex() {
    const { medicines } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Medicines" />
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
                            <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
                            <p className="text-muted-foreground">
                                Drug formulary and catalog management
                            </p>
                        </div>
                    </div>
                    <PermissionGuard permission="inventory.manage" fallback={null}>
                        <Button asChild>
                            <a href="/medicines/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Medicine
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Medicines Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Drug Formulary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Medicine</th>
                                        <th className="text-left p-3">Category</th>
                                        <th className="text-left p-3">Form</th>
                                        <th className="text-left p-3">Strength</th>
                                        <th className="text-left p-3">Stock</th>
                                        <th className="text-left p-3">Price</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.data.map((medicine) => (
                                        <tr key={medicine.id} className="border-b">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">{medicine.name}</p>
                                                    {medicine.generic_name && (
                                                        <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">{medicine.category?.name || 'N/A'}</td>
                                            <td className="p-3">{medicine.form?.name || 'N/A'}</td>
                                            <td className="p-3">{medicine.strength?.name || 'N/A'}</td>
                                            <td className="p-3 font-medium">{medicine.total_stock || 0}</td>
                                            <td className="p-3">{medicine.unit_price ? `KES ${medicine.unit_price}` : 'N/A'}</td>
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
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <PermissionGuard permission="inventory.manage" fallback={null}>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <a href={`/medicines/${medicine.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            if (confirm('Are you sure you want to delete this medicine?')) {
                                                                router.delete(`/medicines/${medicine.id}`, {
                                                                    onSuccess: () => {
                                                                        router.reload();
                                                                    },
                                                                });
                                                            }
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </PermissionGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {medicines.links && medicines.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {medicines.links.map((link: any, index: number) => (
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
