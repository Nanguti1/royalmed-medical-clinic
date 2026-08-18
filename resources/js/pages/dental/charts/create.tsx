import { Head, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
};

export default function DentalChartCreate() {
    const { patient } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        patient_id: patient.id,
        dentist_id: '',
        visit_id: '',
        chart_date: new Date().toISOString().split('T')[0],
        chief_complaint: '',
        medical_history: '',
        dental_history: '',
        oral_hygiene: [] as string[],
        periodontal_status: [] as string[],
        findings: '',
        notes: '',
    });

    // Oral hygiene predefined options
    const oralHygieneOptions = [
        'Excellent oral hygiene',
        'Good oral hygiene',
        'Fair oral hygiene',
        'Poor oral hygiene',
        'Brushes twice daily',
        'Brushes once daily',
        'Irregular brushing',
        'Flosses daily',
        'Flosses occasionally',
        'Never flosses',
        'Uses mouthwash',
        'No mouthwash use',
        'Smoker',
        'Non-smoker',
        'Alcohol consumption',
        'No alcohol consumption',
    ];

    // Periodontal status predefined options
    const periodontalOptions = [
        'Healthy gingiva',
        'Gingivitis',
        'Periodontitis',
        'Advanced periodontitis',
        'Bleeding on probing',
        'No bleeding',
        'Pocket depths 1-3mm',
        'Pocket depths 4-5mm',
        'Pocket depths 6mm+',
        'Clinical attachment loss',
        'No attachment loss',
        'Recession present',
        'No recession',
        'Mobility present',
        'No mobility',
        'Furcation involvement',
        'No furcation involvement',
    ];

    const addOralHygieneItem = (item: string) => {
        if (!data.oral_hygiene.includes(item)) {
            setData('oral_hygiene', [...data.oral_hygiene, item]);
        }
    };

    const removeOralHygieneItem = (item: string) => {
        setData('oral_hygiene', data.oral_hygiene.filter(i => i !== item));
    };

    const addCustomOralHygiene = (item: string) => {
        if (item.trim() && !data.oral_hygiene.includes(item.trim())) {
            setData('oral_hygiene', [...data.oral_hygiene, item.trim()]);
        }
    };

    const addPeriodontalItem = (item: string) => {
        if (!data.periodontal_status.includes(item)) {
            setData('periodontal_status', [...data.periodontal_status, item]);
        }
    };

    const removePeriodontalItem = (item: string) => {
        setData('periodontal_status', data.periodontal_status.filter(i => i !== item));
    };

    const addCustomPeriodontal = (item: string) => {
        if (item.trim() && !data.periodontal_status.includes(item.trim())) {
            setData('periodontal_status', [...data.periodontal_status, item.trim()]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dental/charts');
    };

    return (
        <>
            <Head title={`Create Dental Chart - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/dental/patients/${patient.id}/chart`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Create Dental Chart</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dental Examination</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="chart_date">Chart Date</Label>
                                    <Input
                                        id="chart_date"
                                        type="date"
                                        value={data.chart_date}
                                        onChange={(e) => setData('chart_date', e.target.value)}
                                    />
                                    {errors.chart_date && <p className="text-sm text-destructive">{errors.chart_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dentist_id">Dentist (Optional)</Label>
                                    <Input
                                        id="dentist_id"
                                        type="text"
                                        placeholder="Dentist ID"
                                        value={data.dentist_id}
                                        onChange={(e) => setData('dentist_id', e.target.value)}
                                    />
                                    {errors.dentist_id && <p className="text-sm text-destructive">{errors.dentist_id}</p>}
                                </div>
                            </div>

                            {/* Chief Complaint */}
                            <div className="space-y-2">
                                <Label htmlFor="chief_complaint">Chief Complaint</Label>
                                <Textarea
                                    id="chief_complaint"
                                    placeholder="Patient's main reason for visit"
                                    value={data.chief_complaint}
                                    onChange={(e) => setData('chief_complaint', e.target.value)}
                                    rows={3}
                                />
                                {errors.chief_complaint && <p className="text-sm text-destructive">{errors.chief_complaint}</p>}
                            </div>

                            {/* Medical History */}
                            <div className="space-y-2">
                                <Label htmlFor="medical_history">Medical History</Label>
                                <Textarea
                                    id="medical_history"
                                    placeholder="Relevant medical conditions, medications, allergies"
                                    value={data.medical_history}
                                    onChange={(e) => setData('medical_history', e.target.value)}
                                    rows={3}
                                />
                                {errors.medical_history && <p className="text-sm text-destructive">{errors.medical_history}</p>}
                            </div>

                            {/* Dental History */}
                            <div className="space-y-2">
                                <Label htmlFor="dental_history">Dental History</Label>
                                <Textarea
                                    id="dental_history"
                                    placeholder="Previous dental treatments, oral health history"
                                    value={data.dental_history}
                                    onChange={(e) => setData('dental_history', e.target.value)}
                                    rows={3}
                                />
                                {errors.dental_history && <p className="text-sm text-destructive">{errors.dental_history}</p>}
                            </div>

                            {/* Oral Hygiene */}
                            <div className="space-y-3">
                                <Label>Oral Hygiene Assessment</Label>
                                <div className="space-y-3">
                                    {/* Predefined options */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {oralHygieneOptions.map((option) => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`oral-${option}`}
                                                    checked={data.oral_hygiene.includes(option)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            addOralHygieneItem(option);
                                                        } else {
                                                            removeOralHygieneItem(option);
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`oral-${option}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom option input */}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add custom oral hygiene factor..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    addCustomOralHygiene(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder="Add custom oral hygiene factor..."]') as HTMLInputElement;
                                                if (input) {
                                                    addCustomOralHygiene(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Selected items display */}
                                    {data.oral_hygiene.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.oral_hygiene.map((item) => (
                                                <Badge
                                                    key={item}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                >
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOralHygieneItem(item)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.oral_hygiene && <p className="text-sm text-destructive">{errors.oral_hygiene}</p>}
                            </div>

                            {/* Periodontal Status */}
                            <div className="space-y-3">
                                <Label>Periodontal Status Assessment</Label>
                                <div className="space-y-3">
                                    {/* Predefined options */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {periodontalOptions.map((option) => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`periodontal-${option}`}
                                                    checked={data.periodontal_status.includes(option)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            addPeriodontalItem(option);
                                                        } else {
                                                            removePeriodontalItem(option);
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`periodontal-${option}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom option input */}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add custom periodontal factor..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    addCustomPeriodontal(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder="Add custom periodontal factor..."]') as HTMLInputElement;
                                                if (input) {
                                                    addCustomPeriodontal(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Selected items display */}
                                    {data.periodontal_status.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.periodontal_status.map((item) => (
                                                <Badge
                                                    key={item}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                >
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() => removePeriodontalItem(item)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.periodontal_status && <p className="text-sm text-destructive">{errors.periodontal_status}</p>}
                            </div>

                            {/* Findings */}
                            <div className="space-y-2">
                                <Label htmlFor="findings">Clinical Findings</Label>
                                <Textarea
                                    id="findings"
                                    placeholder="Examination findings, observations"
                                    value={data.findings}
                                    onChange={(e) => setData('findings', e.target.value)}
                                    rows={4}
                                />
                                {errors.findings && <p className="text-sm text-destructive">{errors.findings}</p>}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Any additional notes or recommendations"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/dental/patients/${patient.id}/chart`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Dental Chart'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}