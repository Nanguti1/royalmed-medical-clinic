import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, MapPin, Phone, Trash2, User, Mail, Stethoscope } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Patient } from '@/types/patient';

type PageProps = {
    patient: Patient;
};

export default function PatientShow() {
    const { patient } = usePage<PageProps>().props;

    const fullName = [patient.first_name, patient.other_names, patient.last_name]
        .filter(Boolean)
        .join(' ');

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            router.delete(`/patients/${patient.id}`, {
                onSuccess: () => {
                    window.location.href = '/patients';
                },
            });
        }
    };

    return (
        <>
            <Head title={`${fullName} - Patient Details`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/patients">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
                            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGuard permission="visits.create" fallback={null}>
                            <Button asChild>
                                <a href={`/visits/create?patient_id=${patient.id}`}>
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    New Visit
                                </a>
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="patients.update" fallback={null}>
                            <Button variant="outline" asChild>
                                <a href={`/patients/${patient.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </a>
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="patients.delete" fallback={null}>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Patient Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Full Name</p>
                                <p className="font-medium">{fullName}</p>
                            </div>
                            {patient.gender && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{patient.gender.name}</p>
                                </div>
                            )}
                            {patient.date_of_birth && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{patient.phone}</p>
                                </div>
                            )}
                            {patient.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{patient.email}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Address Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.address && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{patient.address}</p>
                                </div>
                            )}
                            {patient.county && (
                                <div>
                                    <p className="text-sm text-muted-foreground">County</p>
                                    <p className="font-medium">{patient.county.name}</p>
                                </div>
                            )}
                            {patient.sub_county && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Sub County</p>
                                    <p className="font-medium">{patient.sub_county.name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Registered</p>
                                <p className="font-medium">{new Date(patient.created_at).toLocaleDateString()}</p>
                            </div>
                            {patient.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="font-medium">{patient.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
