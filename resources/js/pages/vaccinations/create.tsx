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
    vaccines: Array<{
        id: number;
        name: string;
        code: string;
    }>;
};

export default function VaccinationCreate() {
    const { patients, vaccines } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        vaccine_id: '',
        visit_id: '',
        administration_date: new Date().toISOString().split('T')[0],
        dose_number: '1',
        batch_number: '',
        expiry_date: '',
        site: 'left_arm',
        route: 'intramuscular',
        dosage: '',
        dosage_unit: '',
        reactions: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/vaccinations', {
            onSuccess: () => {
                window.location.href = '/vaccinations';
            },
        });
    };

    return (
        <>
            <Head title="Record Vaccination" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/vaccinations">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Record Vaccination</h1>
                        <p className="text-muted-foreground">Record a new vaccination for a patient.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vaccination Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <Select
                                        value={data.patient_id}
                                        onValueChange={(value) => setData('patient_id', value)}
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
                                    <Label htmlFor="vaccine_id">Vaccine *</Label>
                                    <Select
                                        value={data.vaccine_id}
                                        onValueChange={(value) => setData('vaccine_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vaccine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vaccines.map((vaccine) => (
                                                <SelectItem key={vaccine.id} value={vaccine.id.toString()}>
                                                    {vaccine.name} ({vaccine.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vaccine_id && <p className="text-sm text-red-500">{errors.vaccine_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="administration_date">Administration Date *</Label>
                                    <Input
                                        id="administration_date"
                                        type="date"
                                        value={data.administration_date}
                                        onChange={(e) => setData('administration_date', e.target.value)}
                                    />
                                    {errors.administration_date && <p className="text-sm text-red-500">{errors.administration_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dose_number">Dose Number *</Label>
                                    <Input
                                        id="dose_number"
                                        type="number"
                                        value={data.dose_number}
                                        onChange={(e) => setData('dose_number', e.target.value)}
                                        min="1"
                                    />
                                    {errors.dose_number && <p className="text-sm text-red-500">{errors.dose_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_number">Batch Number</Label>
                                    <Input
                                        id="batch_number"
                                        value={data.batch_number}
                                        onChange={(e) => setData('batch_number', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry_date">Expiry Date</Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site">Site *</Label>
                                    <Select
                                        value={data.site}
                                        onValueChange={(value) => setData('site', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left_arm">Left Arm</SelectItem>
                                            <SelectItem value="right_arm">Right Arm</SelectItem>
                                            <SelectItem value="thigh">Thigh</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.site && <p className="text-sm text-red-500">{errors.site}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="route">Route *</Label>
                                    <Select
                                        value={data.route}
                                        onValueChange={(value) => setData('route', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="intramuscular">Intramuscular</SelectItem>
                                            <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                                            <SelectItem value="oral">Oral</SelectItem>
                                            <SelectItem value="nasal">Nasal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.route && <p className="text-sm text-red-500">{errors.route}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dosage">Dosage</Label>
                                    <Input
                                        id="dosage"
                                        type="number"
                                        step="0.01"
                                        value={data.dosage}
                                        onChange={(e) => setData('dosage', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dosage_unit">Dosage Unit</Label>
                                    <Input
                                        id="dosage_unit"
                                        value={data.dosage_unit}
                                        onChange={(e) => setData('dosage_unit', e.target.value)}
                                        placeholder="e.g., mL, mg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reactions">Reactions</Label>
                                <Input
                                    id="reactions"
                                    value={data.reactions}
                                    onChange={(e) => setData('reactions', e.target.value)}
                                    placeholder="Any adverse reactions"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/vaccinations">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Recording...' : 'Record Vaccination'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
