import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, FlaskConical, Plus, Trash2 } from 'lucide-react';

type PageProps = {
    test: {
        id: number;
        code: string | null;
        name: string;
        description: string | null;
        standard_units: string | null;
        price: number | null;
        lab_category_id: number | null;
        sample_type: string | null;
        sample_requirements: string | null;
        is_critical: boolean;
        turnaround_time_hours: number | null;
        referenceRanges: Array<{
            id: number;
            age_group: string | null;
            sex: string | null;
            min_value: number | null;
            max_value: number | null;
            min_operator: string;
            max_operator: string;
            text_range: string | null;
        }>;
    };
    categories: Array<{
        id: number;
        name: string;
    }>;
};

export default function LabTestEdit() {
    const { test, categories } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        code: test.code || '',
        name: test.name,
        description: test.description || '',
        standard_units: test.standard_units || '',
        price: test.price || '',
        lab_category_id: test.lab_category_id || 0,
        sample_type: test.sample_type || '',
        sample_requirements: test.sample_requirements || '',
        is_critical: test.is_critical,
        turnaround_time_hours: test.turnaround_time_hours || 24,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/lab-tests/${test.id}`);
    };

    const handleDeleteReferenceRange = (rangeId: number) => {
        if (confirm('Are you sure you want to delete this reference range?')) {
            router.delete(`/lab-tests/${test.id}/reference-ranges/${rangeId}`);
        }
    };

    return (
        <>
            <Head title="Edit Lab Test" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/lab-tests">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Lab Test</h1>
                        <p className="text-muted-foreground">
                            Update laboratory test details
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5" />
                            Test Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <AlertError errors={errors} />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <input
                                        id="code"
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., CBC"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., Complete Blood Count"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lab_category_id">Category</Label>
                                    <select
                                        id="lab_category_id"
                                        value={data.lab_category_id}
                                        onChange={(e) => setData('lab_category_id', parseInt(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value={0}>Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.lab_category_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sample_type">Sample Type</Label>
                                    <input
                                        id="sample_type"
                                        type="text"
                                        value={data.sample_type}
                                        onChange={(e) => setData('sample_type', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., Blood"
                                    />
                                    <InputError message={errors.sample_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="standard_units">Standard Units</Label>
                                    <input
                                        id="standard_units"
                                        type="text"
                                        value={data.standard_units}
                                        onChange={(e) => setData('standard_units', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., g/L"
                                    />
                                    <InputError message={errors.standard_units} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value ? parseFloat(e.target.value) : '')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.price} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="turnaround_time_hours">Turnaround Time (hours)</Label>
                                    <input
                                        id="turnaround_time_hours"
                                        type="number"
                                        min="1"
                                        value={data.turnaround_time_hours}
                                        onChange={(e) => setData('turnaround_time_hours', parseInt(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <InputError message={errors.turnaround_time_hours} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Test description..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sample_requirements">Sample Requirements</Label>
                                <textarea
                                    id="sample_requirements"
                                    value={data.sample_requirements}
                                    onChange={(e) => setData('sample_requirements', e.target.value)}
                                    rows={2}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Sample collection requirements..."
                                />
                                <InputError message={errors.sample_requirements} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="is_critical"
                                    type="checkbox"
                                    checked={data.is_critical}
                                    onChange={(e) => setData('is_critical', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="is_critical">Critical test (requires immediate notification)</Label>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/lab-tests">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Test'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Reference Ranges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reference Ranges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {test.referenceRanges.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No reference ranges configured for this test.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {test.referenceRanges.map((range) => (
                                        <div key={range.id} className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                                <p className="font-medium">
                                                    {range.age_group || 'All ages'} • {range.sex || 'All sexes'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {range.min_value !== null && range.max_value !== null
                                                        ? `${range.min_operator} ${range.min_value} - ${range.max_value} ${range.max_operator}`
                                                        : range.text_range || 'N/A'}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteReferenceRange(range.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}