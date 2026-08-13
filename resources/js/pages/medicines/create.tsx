import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { ArrowLeft, Pill } from 'lucide-react';

type PageProps = {
    categories: any[];
    forms: any[];
    strengths: any[];
};

export default function MedicineCreate() {
    const { categories, forms, strengths } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        generic_name: '',
        medicine_category_id: '',
        medicine_form_id: '',
        medicine_strength_id: '',
        unit_price: '',
        reorder_level: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/medicines');
    };

    return (
        <>
            <Head title="Add Medicine" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/medicines">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Add Medicine</h1>
                        <p className="text-muted-foreground">
                            Add new medicine to drug formulary
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Medicine Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AlertError errors={errors} />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Medicine Name *</Label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., Paracetamol 500mg"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="generic_name">Generic Name</Label>
                                    <input
                                        id="generic_name"
                                        type="text"
                                        value={data.generic_name}
                                        onChange={(e) => setData('generic_name', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., Acetaminophen"
                                    />
                                    <InputError message={errors.generic_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medicine_category_id">Category</Label>
                                    <select
                                        id="medicine_category_id"
                                        value={data.medicine_category_id}
                                        onChange={(e) => setData('medicine_category_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.medicine_category_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medicine_form_id">Form</Label>
                                    <select
                                        id="medicine_form_id"
                                        value={data.medicine_form_id}
                                        onChange={(e) => setData('medicine_form_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select form</option>
                                        {forms.map((form) => (
                                            <option key={form.id} value={form.id}>{form.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.medicine_form_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medicine_strength_id">Strength</Label>
                                    <select
                                        id="medicine_strength_id"
                                        value={data.medicine_strength_id}
                                        onChange={(e) => setData('medicine_strength_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select strength</option>
                                        {strengths.map((strength) => (
                                            <option key={strength.id} value={strength.id}>{strength.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.medicine_strength_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_price">Unit Price (KES)</Label>
                                    <input
                                        id="unit_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.unit_price} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reorder_level">Reorder Level</Label>
                                    <input
                                        id="reorder_level"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.reorder_level}
                                        onChange={(e) => setData('reorder_level', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="100"
                                    />
                                    <InputError message={errors.reorder_level} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/medicines">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Medicine'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
