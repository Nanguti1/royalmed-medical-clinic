import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, FlaskConical, Plus, Trash2, User } from 'lucide-react';
import type { Visit, LabTest } from '@/types/visit';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    visit: Visit;
    tests: LabTest[];
};

type TestSelection = {
    lab_test_id: number;
};

export default function LaboratoryCreate() {
    const { visit, tests } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        visit_id: visit.id,
        notes: '',
        tests: [] as TestSelection[],
    });

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const addTest = () => {
        setData('tests', [
            ...data.tests,
            { lab_test_id: 0 },
        ]);
    };

    const removeTest = (index: number) => {
        setData('tests', data.tests.filter((_, i) => i !== index));
    };

    const updateTest = (index: number, field: keyof TestSelection, value: any) => {
        const newTests = [...data.tests];
        newTests[index] = { ...newTests[index], [field]: value };
        setData('tests', newTests);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/laboratory');
    };

    return (
        <>
            <Head title="Request Laboratory Tests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={visit.consultation_id ? `/consultations/${visit.consultation_id}` : `/visits/${visit.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Request Laboratory Tests</h1>
                        <p className="text-muted-foreground">
                            Laboratory order for {patientName}
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

                    {/* Laboratory Order Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                Laboratory Tests
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
                                        placeholder="Additional notes for laboratory..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                {/* Test Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Requested Tests</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addTest}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Test
                                        </Button>
                                    </div>

                                    {data.tests.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No tests added. Click "Add Test" to request laboratory tests.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.tests.map((test, index) => (
                                                <Card key={index} className="p-4">
                                                    <div className="flex justify-between mb-4">
                                                        <h4 className="font-medium">Test {index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeTest(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <Label>Test *</Label>
                                                            <select
                                                                value={test.lab_test_id}
                                                                onChange={(e) => updateTest(index, 'lab_test_id', parseInt(e.target.value))}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            >
                                                                <option value={0}>Select test</option>
                                                                {tests.map((t) => (
                                                                    <option key={t.id} value={t.id}>
                                                                        {t.name}
                                                                    </option>
                                                                ))}
                                                            </select>
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
                                    <PermissionGuard permission="laboratory.order" fallback={null}>
                                        <Button type="submit" disabled={processing || data.tests.length === 0}>
                                            {processing ? 'Creating...' : 'Create Laboratory Order'}
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
