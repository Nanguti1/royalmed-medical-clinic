import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Users, Merge, AlertTriangle, Check, X } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Patient, PatientMergeConflict, PatientMergeData } from '@/types/patient';

type PageProps = {
    sourcePatient: Patient;
    targetPatient: Patient;
    conflicts: PatientMergeConflict[];
};

export default function PatientMerge() {
    const { sourcePatient, targetPatient, conflicts } = usePage<PageProps>().props;
    
    const { data, setData, post, processing, errors } = useForm<PatientMergeData>({
        keep_source: false,
        field_selections: {} as Record<string, 'source' | 'target'>,
    });

    // Initialize field selections with target as default
    conflicts.forEach(conflict => {
        if (!data.field_selections[conflict.field]) {
            setData('field_selections', {
                ...data.field_selections,
                [conflict.field]: 'target'
            });
        }
    });

    const handleFieldSelection = (field: string, value: 'source' | 'target') => {
        setData('field_selections', {
            ...data.field_selections,
            [field]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/patients/${sourcePatient.id}/merge/${targetPatient.id}`);
    };

    const sourceFullName = [sourcePatient.first_name, sourcePatient.other_names, sourcePatient.last_name]
        .filter(Boolean)
        .join(' ');
    
    const targetFullName = [targetPatient.first_name, targetPatient.other_names, targetPatient.last_name]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <Head title="Merge Patients" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/patients">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Merge Patients</h1>
                        <p className="text-muted-foreground">
                            Combine duplicate patient records into a single profile.
                        </p>
                    </div>
                </div>

                {/* Warning Banner */}
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-medium text-orange-900 dark:text-orange-100">
                                    This action cannot be undone
                                </p>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                    The source patient record will be deleted after merging. Review all conflicts carefully before proceeding.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Patient Comparison */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Source Patient */}
                    <Card className={data.keep_source ? 'border-primary' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Source Patient
                                <Badge variant={data.keep_source ? 'default' : 'secondary'}>
                                    {data.keep_source ? 'Will Keep' : 'Will Delete'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{sourceFullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hospital Number</p>
                                <p className="font-medium">{sourcePatient.hospital_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Patient ID</p>
                                <p className="font-medium">{sourcePatient.id}</p>
                            </div>
                            {sourcePatient.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{sourcePatient.phone}</p>
                                </div>
                            )}
                            {sourcePatient.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{sourcePatient.email}</p>
                                </div>
                            )}
                            {sourcePatient.date_of_birth && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(sourcePatient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Target Patient */}
                    <Card className={!data.keep_source ? 'border-primary' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Target Patient
                                <Badge variant={!data.keep_source ? 'default' : 'secondary'}>
                                    {!data.keep_source ? 'Will Keep' : 'Will Delete'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{targetFullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hospital Number</p>
                                <p className="font-medium">{targetPatient.hospital_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Patient ID</p>
                                <p className="font-medium">{targetPatient.id}</p>
                            </div>
                            {targetPatient.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{targetPatient.phone}</p>
                                </div>
                            )}
                            {targetPatient.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{targetPatient.email}</p>
                                </div>
                            )}
                            {targetPatient.date_of_birth && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(targetPatient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Merge Direction Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Merge Direction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setData('keep_source', false)}>
                                <Checkbox 
                                    id="target"
                                    checked={!data.keep_source}
                                    onCheckedChange={(checked) => { if (checked) setData('keep_source', false); }}
                                />
                                <Label htmlFor="target" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Keep Target Patient</div>
                                    <div className="text-sm text-muted-foreground">
                                        Merge source patient data into {targetFullName} and delete source record
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setData('keep_source', true)}>
                                <Checkbox 
                                    id="source"
                                    checked={data.keep_source}
                                    onCheckedChange={(checked) => { if (checked) setData('keep_source', true); }}
                                />
                                <Label htmlFor="source" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Keep Source Patient</div>
                                    <div className="text-sm text-muted-foreground">
                                        Merge target patient data into {sourceFullName} and delete target record
                                    </div>
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Conflict Resolution */}
                {conflicts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Resolve Conflicts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AlertError errors={errors} />
                            <div className="space-y-4">
                                {conflicts.map((conflict) => (
                                    <div key={conflict.field} className="border rounded-lg p-4">
                                        <div className="font-medium mb-3 capitalize">
                                            {conflict.field.replace(/_/g, ' ')}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => handleFieldSelection(conflict.field, 'source')}>
                                                <Checkbox 
                                                    id={`${conflict.field}-source`}
                                                    checked={data.field_selections[conflict.field] === 'source'}
                                                    onCheckedChange={(checked) => { if (checked) handleFieldSelection(conflict.field, 'source'); }}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor={`${conflict.field}-source`} className="flex-1 cursor-pointer">
                                                    <div className="text-sm font-medium">Source</div>
                                                    <div className="text-sm text-muted-foreground">{conflict.sourceValue || '(empty)'}</div>
                                                </Label>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => handleFieldSelection(conflict.field, 'target')}>
                                                <Checkbox 
                                                    id={`${conflict.field}-target`}
                                                    checked={data.field_selections[conflict.field] === 'target'}
                                                    onCheckedChange={(checked) => { if (checked) handleFieldSelection(conflict.field, 'target'); }}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor={`${conflict.field}-target`} className="flex-1 cursor-pointer">
                                                    <div className="text-sm font-medium">Target</div>
                                                    <div className="text-sm text-muted-foreground">{conflict.targetValue || '(empty)'}</div>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <a href="/patients">Cancel</a>
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing}
                        onClick={handleSubmit}
                        className="gap-2"
                    >
                        <Merge className="h-4 w-4" />
                        {processing ? 'Merging...' : 'Merge Patients'}
                    </Button>
                </div>
            </div>
        </>
    );
}