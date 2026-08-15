import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { ConsultationTemplateFormData } from '@/types/visit';

export default function ConsultationTemplateCreate() {
    const { data, setData, post, processing, errors } = useForm<ConsultationTemplateFormData>({
        name: '',
        description: '',
        category: '',
        chief_complaint_template: '',
        history_template: '',
        examination_template: '',
        plan_template: '',
        notes_template: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/consultations/templates');
    };

    return (
        <>
            <Head title="Create Consultation Template" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/consultations/templates">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Consultation Template</h1>
                        <p className="text-muted-foreground">
                            Create a reusable template for consultation notes
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Template Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AlertError errors={errors} />

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="name">Template Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., General Adult Checkup"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={2}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Brief description of when to use this template..."
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            placeholder="e.g., General, Pediatric, Chronic Care"
                                        />
                                        <InputError message={errors.category} />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-6">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active (available for use)
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Template Content */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Template Content</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use placeholders like patient_name, age, gender for dynamic content
                                </p>

                                <div className="space-y-2">
                                    <Label htmlFor="chief_complaint_template">Chief Complaint Template</Label>
                                    <textarea
                                        id="chief_complaint_template"
                                        value={data.chief_complaint_template}
                                        onChange={(e) => setData('chief_complaint_template', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Patient presents with..."
                                    />
                                    <InputError message={errors.chief_complaint_template} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="history_template">History Template</Label>
                                    <textarea
                                        id="history_template"
                                        value={data.history_template}
                                        onChange={(e) => setData('history_template', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Patient has a history of..."
                                    />
                                    <InputError message={errors.history_template} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="examination_template">Examination Template</Label>
                                    <textarea
                                        id="examination_template"
                                        value={data.examination_template}
                                        onChange={(e) => setData('examination_template', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="On examination..."
                                    />
                                    <InputError message={errors.examination_template} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan_template">Plan Template</Label>
                                    <textarea
                                        id="plan_template"
                                        value={data.plan_template}
                                        onChange={(e) => setData('plan_template', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Plan includes..."
                                    />
                                    <InputError message={errors.plan_template} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes_template">Additional Notes Template</Label>
                                    <textarea
                                        id="notes_template"
                                        value={data.notes_template}
                                        onChange={(e) => setData('notes_template', e.target.value)}
                                        rows={2}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Additional notes..."
                                    />
                                    <InputError message={errors.notes_template} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/consultations/templates">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Template'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}