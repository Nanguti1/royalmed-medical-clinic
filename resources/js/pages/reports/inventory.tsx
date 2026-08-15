import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButtons } from '@/components/reports/export-buttons';
import type { InventoryReport } from '@/types/report';

type PageProps = {
    inventory_report: InventoryReport;
};

export default function InventoryReport() {
    const { inventory_report } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Inventory Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Report</h1>
                        <p className="text-muted-foreground">Current inventory status and stock levels.</p>
                    </div>
                    <ExportButtons
                        onExportPDF={() => console.log('Export PDF')}
                        onExportExcel={() => console.log('Export Excel')}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inventory_report.total_items}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inventory_report.low_stock_items}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inventory_report.out_of_stock_items}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inventory_report.expiring_soon}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${inventory_report.total_value.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>By Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(inventory_report.by_category).map(([category, count]) => (
                                <div key={category} className="flex justify-between items-center">
                                    <span className="text-sm">{category}</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
