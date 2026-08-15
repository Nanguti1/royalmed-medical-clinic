import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type PageProps = {
    patients: Array<{
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    }>;
};

export default function DocumentUpload() {
    const { patients } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        title: '',
        category: 'general',
        file: null as File | null,
        description: '',
        is_sensitive: false,
        is_confidential: false,
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        if (data.patient_id) formData.append('patient_id', data.patient_id);
        formData.append('title', data.title);
        formData.append('category', data.category);
        if (data.file) formData.append('file', data.file);
        if (data.description) formData.append('description', data.description);
        formData.append('is_sensitive', data.is_sensitive.toString());
        formData.append('is_confidential', data.is_confidential.toString());
        if (data.expires_at) formData.append('expires_at', data.expires_at);

        post('/documents', {
            data: formData,
            onSuccess: () => {
                window.location.href = '/documents';
            },
        });
    };

    return (
        <>
            <Head title="Upload Document" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/documents">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
                        <p className="text-muted-foreground">Upload a new document to the library.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Document Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient</Label>
                                    <Select
                                        value={data.patient_id}
                                        onValueChange={(value) => setData('patient_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No patient</SelectItem>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                                    {patient.first_name} {patient.last_name} ({patient.hospital_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="medical">Medical</SelectItem>
                                            <SelectItem value="lab">Lab</SelectItem>
                                            <SelectItem value="radiology">Radiology</SelectItem>
                                            <SelectItem value="consent">Consent</SelectItem>
                                            <SelectItem value="insurance">Insurance</SelectItem>
                                            <SelectItem value="legal">Legal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Document title"
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="file">File *</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    />
                                    {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="expires_at">Expiry Date</Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Document description"
                                />
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_sensitive"
                                        checked={data.is_sensitive}
                                        onCheckedChange={(checked) => setData('is_sensitive', checked as boolean)}
                                    />
                                    <Label htmlFor="is_sensitive" className="cursor-pointer">Sensitive</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_confidential"
                                        checked={data.is_confidential}
                                        onCheckedChange={(checked) => setData('is_confidential', checked as boolean)}
                                    />
                                    <Label htmlFor="is_confidential" className="cursor-pointer">Confidential</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/documents">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
