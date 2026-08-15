import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Camera, Upload, X, User, AlertCircle } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import type { Patient } from '@/types/patient';

type PageProps = {
    patient: Patient;
};

export default function PatientPhotoUpload() {
    const { patient } = usePage<PageProps>().props;
    const [preview, setPreview] = useState<string | null>(patient.photo_path || null);
    const [file, setFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        photo: null as File | null,
    });

    const fullName = [patient.first_name, patient.other_names, patient.last_name]
        .filter(Boolean)
        .join(' ');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setData('photo', selectedFile);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemovePhoto = () => {
        setFile(null);
        setPreview(null);
        setData('photo', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        if (data.photo) {
            formData.append('photo', data.photo);
        }
        
        post(`/patients/${patient.id}/photo`, {
            data: formData,
            onSuccess: () => {
                window.location.href = `/patients/${patient.id}`;
            },
        });
    };

    return (
        <>
            <Head title={`Upload Photo - ${fullName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Photo</h1>
                        <p className="text-muted-foreground">
                            Upload or update photo for {fullName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Photo Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Upload Photo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                {/* Photo Preview/Upload Area */}
                                <div className="space-y-4">
                                    <Label htmlFor="photo">Patient Photo</Label>
                                    
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:bg-accent/50 transition-colors">
                                        {preview ? (
                                            <div className="relative w-48 h-48">
                                                <img
                                                    src={preview}
                                                    alt={`${fullName}'s photo`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2"
                                                    onClick={handleRemovePhoto}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-center">
                                                <User className="h-16 w-16 text-muted-foreground" />
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Drag and drop a photo here, or click to browse
                                                    </p>
                                                    <Label
                                                        htmlFor="photo"
                                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                        Choose File
                                                    </Label>
                                                    <input
                                                        id="photo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {file && (
                                        <div className="text-sm text-muted-foreground">
                                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </div>
                                    )}

                                    <InputError message={errors.photo} />
                                </div>

                                {/* Guidelines */}
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                            <p className="font-medium">Photo Guidelines:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Use a clear, recent photo of the patient</li>
                                                <li>Face should be clearly visible</li>
                                                <li>Recommended size: 200x200 to 400x400 pixels</li>
                                                <li>Maximum file size: 5MB</li>
                                                <li>Accepted formats: JPG, PNG, WEBP</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/patients/${patient.id}`}>Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing || !file}>
                                        {processing ? 'Uploading...' : 'Upload Photo'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Patient Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hospital Number</p>
                                <p className="font-medium">{patient.hospital_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Patient ID</p>
                                <p className="font-medium">{patient.id}</p>
                            </div>
                            {patient.date_of_birth && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            )}
                            {patient.gender_id && patient.gender && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{patient.gender.name}</p>
                                </div>
                            )}
                            {patient.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{patient.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}