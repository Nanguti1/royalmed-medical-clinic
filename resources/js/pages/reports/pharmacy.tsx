import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Pill, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { ExportButtons } from '@/components/reports/export-buttons';
import { DataTable } from '@/components/reports/data-table';
import type { DrugConsumption, InventoryTurnover } from '@/types/report';

type PageProps = {
    drug_consumption: DrugConsumption;
    inventory_turnover: InventoryTurnover;
    filters: {
        start_date: string;
        end_date: string;
    };
};

export default function PharmacyReport() {
    const { drug_consumption, inventory_turnover, filters } = usePage<PageProps>().props;

    const handleFilter = (startDate: string, endDate: string) => {
        window.location.href = `/reports/pharmacy?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <>
            <Head title="Pharmacy Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Report</h1>
                        <p className="text-muted-foreground">Drug consumption and inventory management.</p>
                    </div>
                    <div className="flex gap-2">
                        <DateRangePicker
                            startDate={filters.start_date}
                            endDate={filters.end_date}
                            onFilter={handleFilter}
                        />
                        <ExportButtons
                            onExportPDF={() => console.log('Export PDF')}
                            onExportExcel={() => console.log('Export Excel')}
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <DataTable
                        title="Drug Consumption"
                        columns={[
                            { key: 'drug_name', label: 'Drug Name' },
                            { key: 'quantity_used', label: 'Quantity Used' },
                            { key: 'cost', label: 'Cost' },
                            { key: 'by_prescription', label: 'Prescription' },
                            { key: 'by_dispense', label: 'Dispense' },
                        ]}
                        data={drug_consumption}
                    />

                    <DataTable
                        title="Inventory Turnover"
                        columns={[
                            { key: 'item_name', label: 'Item Name' },
                            { key: 'turnover_rate', label: 'Turnover Rate' },
                            { key: 'days_on_hand', label: 'Days on Hand' },
                            { key: 'category', label: 'Category' },
                        ]}
                        data={inventory_turnover}
                    />
                </div>
            </div>
        </>
    );
}
