import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    patients: Array<{
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    }>;
    defaults: {
        patient_id?: number;
    };
};

export default function TreatmentPlanCreate() {
    const { patients, defaults } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        patient_id: defaults.patient_id,
        plan_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        priority: 'medium',
        estimated_cost: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dental/treatment-plans');
    };

    return (
        <>
            <Head title="New Treatment Plan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/dental/treatment-plans">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Treatment Plan</h1>
                        <p className="text-muted-foreground">Create a new dental treatment plan for a patient.</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Treatment Plan Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <Select
                                        value={data.patient_id?.toString()}
                                        onValueChange={(value) => setData('patient_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                                    {patient.first_name} {patient.last_name} ({patient.hospital_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan_date">Plan Date *</Label>
                                    <Input
                                        id="plan_date"
                                        type="date"
                                        value={data.plan_date}
                                        onChange={(e) => setData('plan_date', e.target.value)}
                                    />
                                    {errors.plan_date && <p className="text-sm text-red-500">{errors.plan_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value) => setData('priority', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_cost">Estimated Cost</Label>
                                    <Input
                                        id="estimated_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.estimated_cost}
                                        onChange={(e) => setData('estimated_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.estimated_cost && <p className="text-sm text-red-500">{errors.estimated_cost}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes"
                                />
                                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/dental/treatment-plans">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Treatment Plan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
