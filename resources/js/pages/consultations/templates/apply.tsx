import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Check, X } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { ConsultationTemplate, Visit } from '@/types/visit';

type PageProps = {
    template: ConsultationTemplate;
    visit: Visit;
};

export default function ConsultationTemplateApply() {
    const { template, visit } = usePage<PageProps>().props;

    const patientName = visit.patient
        ? [visit.patient.first_name, visit.patient.other_names, visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const { data, setData, post, processing, errors } = useForm({
        visit_id: visit.id,
        template_id: template.id,
        chief_complaint: template.chief_complaint_template || '',
        history: template.history_template || '',
        examination: template.examination_template || '',
        plan: template.plan_template || '',
        notes: template.notes_template || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/consultations/templates/apply');
    };

    const handleCancel = () => {
        window.location.href = `/consultations/create?visit_id=${visit.id}`;
    };

    return (
        <>
            <Head title={`Apply Template - ${template.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/consultations/templates">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Apply Template</h1>
                        <p className="text-muted-foreground">
                            Applying template "{template.name}" to consultation for {patientName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Template Info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Template Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{template.name}</p>
                            </div>
                            {template.category && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <Badge variant="secondary">{template.category}</Badge>
                                </div>
                            )}
                            {template.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm">{template.description}</p>
                                </div>
                            )}
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Template Sections</p>
                                <div className="space-y-1">
                                    {template.chief_complaint_template && (
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Chief Complaint</div>
                                    )}
                                    {template.history_template && (
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ History</div>
                                    )}
                                    {template.examination_template && (
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Examination</div>
                                    )}
                                    {template.plan_template && (
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Plan</div>
                                    )}
                                    {template.notes_template && (
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Notes</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Review and Customize</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Tip:</strong> You can customize the template content below before applying it to the consultation.
                                    </p>
                                </div>

                                {template.chief_complaint_template && (
                                    <div className="space-y-2">
                                        <Label htmlFor="chief_complaint">Chief Complaint</Label>
                                        <textarea
                                            id="chief_complaint"
                                            value={data.chief_complaint}
                                            onChange={(e) => setData('chief_complaint', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.chief_complaint} />
                                    </div>
                                )}

                                {template.history_template && (
                                    <div className="space-y-2">
                                        <Label htmlFor="history">History</Label>
                                        <textarea
                                            id="history"
                                            value={data.history}
                                            onChange={(e) => setData('history', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.history} />
                                    </div>
                                )}

                                {template.examination_template && (
                                    <div className="space-y-2">
                                        <Label htmlFor="examination">Examination</Label>
                                        <textarea
                                            id="examination"
                                            value={data.examination}
                                            onChange={(e) => setData('examination', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.examination} />
                                    </div>
                                )}

                                {template.plan_template && (
                                    <div className="space-y-2">
                                        <Label htmlFor="plan">Plan</Label>
                                        <textarea
                                            id="plan"
                                            value={data.plan}
                                            onChange={(e) => setData('plan', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.plan} />
                                    </div>
                                )}

                                {template.notes_template && (
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes</Label>
                                        <textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={2}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                )}

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Check className="mr-2 h-4 w-4" />
                                        {processing ? 'Applying...' : 'Apply Template'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}