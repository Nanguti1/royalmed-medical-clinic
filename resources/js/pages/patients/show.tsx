import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, MapPin, Phone, Trash2, User, Mail, Stethoscope, AlertTriangle, Shield, Heart, Users, CreditCard, Baby, Briefcase, Church, Languages, Droplet } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
                            <p className="text-muted-foreground">Hospital Number: {patient.hospital_number} • Patient ID: {patient.id}</p>
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

                {/* Safety Alerts */}
                {(patient.activeAlerts && patient.activeAlerts.length > 0) && (
                    <div className="grid gap-4">
                        {patient.activeAlerts.map((alert) => (
                            <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={`h-5 w-5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                                        <div className="flex-1">
                                            <p className="font-semibold">{alert.alert_type}</p>
                                            <p className="text-sm">{alert.message}</p>
                                        </div>
                                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                            {alert.severity}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

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
                            <div>
                                <p className="text-sm text-muted-foreground">Hospital Number</p>
                                <p className="font-medium">{patient.hospital_number}</p>
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
                            {patient.blood_group && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Blood Group</p>
                                    <p className="font-medium">{patient.blood_group}</p>
                                </div>
                            )}
                            {patient.marital_status && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Marital Status</p>
                                    <p className="font-medium">{patient.marital_status}</p>
                                </div>
                            )}
                            {patient.occupation && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Occupation</p>
                                    <p className="font-medium">{patient.occupation}</p>
                                </div>
                            )}
                            {patient.employer && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Employer</p>
                                    <p className="font-medium">{patient.employer}</p>
                                </div>
                            )}
                            {patient.preferred_language && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Preferred Language</p>
                                    <p className="font-medium">{patient.preferred_language}</p>
                                </div>
                            )}
                            {patient.religion && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Religion</p>
                                    <p className="font-medium">{patient.religion}</p>
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
                                    <p className="text-sm text-muted-foreground">Primary Phone</p>
                                    <p className="font-medium">{patient.phone}</p>
                                </div>
                            )}
                            {patient.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{patient.email}</p>
                                </div>
                            )}
                            {patient.contacts && patient.contacts.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Additional Contacts</p>
                                    {patient.contacts.map((contact) => (
                                        <div key={contact.id} className="flex items-center justify-between text-sm">
                                            <span>{contact.contact_type}</span>
                                            <span className="font-medium">{contact.contact_value}</span>
                                        </div>
                                    ))}
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
                                    <p className="text-sm text-muted-foreground">Primary Address</p>
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
                            {patient.addresses && patient.addresses.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Additional Addresses</p>
                                    {patient.addresses.map((addr) => (
                                        <div key={addr.id} className="text-sm">
                                            <p className="font-medium">{addr.address_type}</p>
                                            <p className="text-muted-foreground">{addr.address_line1}, {addr.city}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Patient Identifiers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Patient Identifiers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.identifiers && patient.identifiers.length > 0 ? (
                                patient.identifiers.map((identifier) => (
                                    <div key={identifier.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{identifier.identifier_type}</p>
                                            <p className="font-medium">{identifier.identifier_value}</p>
                                        </div>
                                        {identifier.is_primary && (
                                            <Badge variant="secondary">Primary</Badge>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No identifiers recorded</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Emergency Contacts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Emergency Contacts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
                                patient.emergencyContacts.map((contact) => (
                                    <div key={contact.id} className="space-y-1">
                                        <p className="font-medium">{contact.name} ({contact.relationship})</p>
                                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                                        {contact.address && (
                                            <p className="text-sm text-muted-foreground">{contact.address}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No emergency contacts recorded</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Allergies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Allergies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.activeAllergies && patient.activeAllergies.length > 0 ? (
                                patient.activeAllergies.map((allergy) => (
                                    <div key={allergy.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{allergy.allergen}</p>
                                            <p className="text-sm text-muted-foreground">Severity: {allergy.severity}</p>
                                            {allergy.reaction && (
                                                <p className="text-sm text-muted-foreground">Reaction: {allergy.reaction}</p>
                                            )}
                                        </div>
                                        <Badge variant={allergy.severity === 'severe' ? 'destructive' : 'secondary'}>
                                            {allergy.severity}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No allergies recorded</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chronic Conditions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Chronic Conditions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.activeChronicConditions && patient.activeChronicConditions.length > 0 ? (
                                patient.activeChronicConditions.map((condition) => (
                                    <div key={condition.id} className="space-y-1">
                                        <p className="font-medium">{condition.condition_name}</p>
                                        <p className="text-sm text-muted-foreground">Status: {condition.status}</p>
                                        {condition.diagnosis_date && (
                                            <p className="text-sm text-muted-foreground">Diagnosed: {new Date(condition.diagnosis_date).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No chronic conditions recorded</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Family Relationships */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Family Relationships
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.relationships && patient.relationships.length > 0 ? (
                                patient.relationships.map((rel) => (
                                    <div key={rel.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{rel.relationship_type}</p>
                                            {rel.related_patient && (
                                                <p className="text-sm text-muted-foreground">
                                                    {rel.related_patient.first_name} {rel.related_patient.last_name} ({rel.related_patient.hospital_number})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No family relationships recorded</p>
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
