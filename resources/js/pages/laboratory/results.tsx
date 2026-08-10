import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, FlaskConical, User } from 'lucide-react';
import type { LabOrder } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    order: LabOrder;
};

export default function LaboratoryResults() {
    const { order } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        lab_test_id: 0,
        lab_order_item_id: 0,
        result_value: '',
        units: '',
        reference_range: '',
        notes: '',
    });

    const patientName = order.visit?.patient
        ? [order.visit.patient.first_name, order.visit.patient.other_names, order.visit.patient.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Patient';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/laboratory/${order.id}/results`);
    };

    const hasItemsWithoutResults = order.items?.some((item) => !item.result);

    return (
        <>
            <Head title="Enter Laboratory Results" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/laboratory/${order.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Enter Laboratory Results</h1>
                        <p className="text-muted-foreground">
                            {patientName} • Lab Order #{order.id}
                        </p>
                    </div>
                </div>

                {!hasItemsWithoutResults && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                        <CardContent className="pt-6">
                            <p className="text-yellow-800 dark:text-yellow-200">
                                All tests have results entered. Return to the laboratory order view.
                            </p>
                        </CardContent>
                    </Card>
                )}

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
                                <p className="font-medium">#{order.visit_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Order Date</p>
                                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Entry Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                Enter Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="space-y-2">
                                    <Label htmlFor="lab_order_item_id">Test *</Label>
                                    <select
                                        id="lab_order_item_id"
                                        value={data.lab_order_item_id}
                                        onChange={(e) => setData('lab_order_item_id', parseInt(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value={0}>Select test</option>
                                        {order.items?.filter((item) => !item.result).map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.test?.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.lab_order_item_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="result_value">Result Value *</Label>
                                    <textarea
                                        id="result_value"
                                        value={data.result_value}
                                        onChange={(e) => setData('result_value', e.target.value)}
                                        rows={2}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Enter test result..."
                                    />
                                    <InputError message={errors.result_value} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="units">Units</Label>
                                    <input
                                        id="units"
                                        type="text"
                                        value={data.units}
                                        onChange={(e) => setData('units', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., mmol/L"
                                    />
                                    <InputError message={errors.units} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_range">Reference Range</Label>
                                    <input
                                        id="reference_range"
                                        type="text"
                                        value={data.reference_range}
                                        onChange={(e) => setData('reference_range', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., 3.9-6.1 mmol/L"
                                    />
                                    <InputError message={errors.reference_range} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Additional notes..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/laboratory/${order.id}`}>Cancel</a>
                                    </Button>
                                    <PermissionGuard permission="laboratory.result" fallback={null}>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Result'}
                                        </Button>
                                    </PermissionGuard>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
