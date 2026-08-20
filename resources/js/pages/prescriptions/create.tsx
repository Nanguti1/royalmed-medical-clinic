import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Pill, Plus, Trash2, User, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Visit, Medicine, DosageUnit, Frequency, Route, DurationUnit } from '@/types/visit';
import type { DrugInteraction } from '@/types/pharmacy';
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

    const checkDrugInteractions = (): DrugInteraction[] => {
        const selectedMedicineIds = data.items.map(item => item.medicine_id).filter(id => id > 0);
        const interactions: DrugInteraction[] = [];

        for (let i = 0; i < selectedMedicineIds.length; i++) {
            for (let j = i + 1; j < selectedMedicineIds.length; j++) {
                const drug1 = medicines.find(m => m.id === selectedMedicineIds[i]);
                const drug2 = medicines.find(m => m.id === selectedMedicineIds[j]);

                if (drug1 && drug2) {
                    const interaction = detectInteraction(drug1.name, drug2.name);
                    if (interaction) {
                        interactions.push(interaction);
                    }
                }
            }
        }

        return interactions;
    };

    const detectInteraction = (drug1: string, drug2: string): DrugInteraction | null => {
        const drug1Lower = drug1.toLowerCase();
        const drug2Lower = drug2.toLowerCase();

        const knownInteractions: DrugInteraction[] = [
            {
                drug1: 'warfarin',
                drug2: 'aspirin',
                severity: 'major',
                description: 'Increased risk of bleeding',
                recommendation: 'Monitor INR closely, consider alternative'
            },
            {
                drug1: 'ace inhibitors',
                drug2: 'potassium supplements',
                severity: 'major',
                description: 'Risk of hyperkalemia',
                recommendation: 'Monitor potassium levels'
            },
            {
                drug1: 'ssris',
                drug2: 'maois',
                severity: 'contraindicated',
                description: 'Serotonin syndrome risk',
                recommendation: 'Avoid combination'
            },
        ];

        for (const interaction of knownInteractions) {
            if ((drug1Lower.includes(interaction.drug1) && drug2Lower.includes(interaction.drug2)) ||
                (drug1Lower.includes(interaction.drug2) && drug2Lower.includes(interaction.drug1))) {
                return interaction;
            }
        }

        return null;
    };

    const interactions = checkDrugInteractions();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/prescriptions', {
            onSuccess: () => {
                // After successful prescription creation, navigate back to consultation
                if (visit.consultation_id) {
                    window.location.href = `/consultations/${visit.consultation_id}`;
                } else {
                    window.location.href = `/visits/${visit.id}`;
                }
            },
        });
    };

    return (
        <>
            <Head title="Create Prescription" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={visit.consultation_id ? `/consultations/${visit.consultation_id}` : `/visits/${visit.id}`}>
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

                {/* Drug Interaction Warnings */}
                {interactions.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <XCircle className="h-5 w-5" />
                                Drug Interaction Warnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {interactions.map((interaction, index) => (
                                    <div key={index} className="p-3 border border-red-300 rounded bg-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={interaction.severity === 'contraindicated' ? 'destructive' : interaction.severity === 'major' ? 'destructive' : 'secondary'}>
                                                {interaction.severity.toUpperCase()}
                                            </Badge>
                                            <span className="font-medium">{interaction.drug1} ↔ {interaction.drug2}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{interaction.description}</p>
                                        <p className="text-sm font-medium text-red-600 mt-1">{interaction.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                                                value={item.medicine_id === 0 ? '' : item.medicine_id.toString()}
                                                                onChange={(e) => updateItem(index, 'medicine_id', e.target.value ? parseInt(e.target.value) : 0)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value="">Select medicine</option>
                                                                {medicines.map((med) => (
                                                                    <option
                                                                        key={med.id}
                                                                        value={med.id.toString()}
                                                                        disabled={!med.is_available}
                                                                        className={!med.is_available ? 'text-muted-foreground' : ''}
                                                                    >
                                                                        {med.name} {!med.is_available && '(Unavailable)'} - Stock: {med.total_stock || 0}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {item.medicine_id && medicines.find(m => m.id === item.medicine_id)?.has_expired && (
                                                                <p className="text-sm text-red-600 flex items-center gap-1">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    This medicine has expired stock
                                                                </p>
                                                            )}
                                                            {item.medicine_id && medicines.find(m => m.id === item.medicine_id)?.is_low_stock && (
                                                                <p className="text-sm text-yellow-600 flex items-center gap-1">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Low stock level
                                                                </p>
                                                            )}
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
                                        <a href={visit.consultation_id ? `/consultations/${visit.consultation_id}` : `/visits/${visit.id}`}>Cancel</a>
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
