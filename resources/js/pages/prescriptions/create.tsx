import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Pill, Plus, Trash2, User } from 'lucide-react';
import type { Visit, Medicine, DosageUnit, Frequency, Route, DurationUnit } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    visit: Visit;
    medicines: Medicine[];
    dosageUnits: DosageUnit[];
    frequencies: Frequency[];
    routes: Route[];
    durationUnits: DurationUnit[];
};

type PrescriptionItem = {
    medicine_id: number;
    dosage_unit_id: number | null;
    frequency_id: number | null;
    route_id: number | null;
    duration_unit_id: number | null;
    duration_quantity: number | null;
    quantity: number;
    instructions: string | null;
};

export default function PrescriptionCreate() {
    const { visit, medicines, dosageUnits, frequencies, routes, durationUnits } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        visit_id: visit.id,
        notes: '',
        items: [] as PrescriptionItem[],
    });

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                medicine_id: 0,
                dosage_unit_id: null,
                frequency_id: null,
                route_id: null,
                duration_unit_id: null,
                duration_quantity: null,
                quantity: 1,
                instructions: '',
            },
        ]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/prescriptions');
    };

    return (
        <>
            <Head title="Create Prescription" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/visits/${visit.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Prescription</h1>
                        <p className="text-muted-foreground">
                            Prescription for {patientName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Patient & Visit Info */}
                    <Card className="lg:col-span-1">
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
                                <p className="font-medium">#{visit.id}</p>
                            </div>
                            {visit.consultation && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Consultation ID</p>
                                    <p className="font-medium">#{visit.consultation.id}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Prescription Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Prescription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Additional prescription notes..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                {/* Prescription Items */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Prescription Items</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Medicine
                                        </Button>
                                    </div>

                                    {data.items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No medicines added. Click "Add Medicine" to add prescription items.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.items.map((item, index) => (
                                                <Card key={index} className="p-4">
                                                    <div className="flex justify-between mb-4">
                                                        <h4 className="font-medium">Item {index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Medicine *</Label>
                                                            <select
                                                                value={item.medicine_id}
                                                                onChange={(e) => updateItem(index, 'medicine_id', parseInt(e.target.value))}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value={0}>Select medicine</option>
                                                                {medicines.map((med) => (
                                                                    <option key={med.id} value={med.id}>
                                                                        {med.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Quantity *</Label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Dosage Unit</Label>
                                                            <select
                                                                value={item.dosage_unit_id || ''}
                                                                onChange={(e) => updateItem(index, 'dosage_unit_id', e.target.value ? parseInt(e.target.value) : null)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value="">Select dosage unit</option>
                                                                {dosageUnits.map((unit) => (
                                                                    <option key={unit.id} value={unit.id}>
                                                                        {unit.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Frequency</Label>
                                                            <select
                                                                value={item.frequency_id || ''}
                                                                onChange={(e) => updateItem(index, 'frequency_id', e.target.value ? parseInt(e.target.value) : null)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value="">Select frequency</option>
                                                                {frequencies.map((freq) => (
                                                                    <option key={freq.id} value={freq.id}>
                                                                        {freq.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Route</Label>
                                                            <select
                                                                value={item.route_id || ''}
                                                                onChange={(e) => updateItem(index, 'route_id', e.target.value ? parseInt(e.target.value) : null)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value="">Select route</option>
                                                                {routes.map((r) => (
                                                                    <option key={r.id} value={r.id}>
                                                                        {r.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Duration Unit</Label>
                                                            <select
                                                                value={item.duration_unit_id || ''}
                                                                onChange={(e) => updateItem(index, 'duration_unit_id', e.target.value ? parseInt(e.target.value) : null)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value="">Select duration unit</option>
                                                                {durationUnits.map((du) => (
                                                                    <option key={du.id} value={du.id}>
                                                                        {du.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Duration Quantity</Label>
                                                            <input
                                                                type="number"
                                                                value={item.duration_quantity || ''}
                                                                onChange={(e) => updateItem(index, 'duration_quantity', e.target.value ? parseFloat(e.target.value) : null)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label>Instructions</Label>
                                                            <textarea
                                                                value={item.instructions || ''}
                                                                onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                                                                rows={2}
                                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                                placeholder="Administration instructions..."
                                                            />
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/visits/${visit.id}`}>Cancel</a>
                                    </Button>
                                    <PermissionGuard permission="consultations.create" fallback={null}>
                                        <Button type="submit" disabled={processing || data.items.length === 0}>
                                            {processing ? 'Creating...' : 'Create Prescription'}
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
