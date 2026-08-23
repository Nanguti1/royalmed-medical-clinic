import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Phone, User, Users, CreditCard, Shield, Heart, AlertTriangle } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Gender, Patient } from '@/types/patient';
import { useState, useEffect } from 'react';

type PageProps = {
    patient: Patient;
    genders: Gender[];
    counties: Array<{
        id: number;
        name: string;
        code: number;
        headquarters: string;
        sub_counties: Array<{
            id: number;
            name: string;
        }>;
    }>;
};

export default function PatientEdit() {
    const { patient, genders, counties } = usePage<PageProps>().props;
    const [selectedCounty, setSelectedCounty] = useState<number | ''>(patient.county_id ? Number(patient.county_id) : '');

    useEffect(() => {
        setSelectedCounty(patient.county_id ? Number(patient.county_id) : '');
    }, [patient.county_id]);

    const { data, setData, put, processing, errors } = useForm({
        first_name: patient.first_name,
        last_name: patient.last_name,
        other_names: patient.other_names || '',
        gender_id: patient.gender_id?.toString() || '',
        date_of_birth: patient.date_of_birth || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        county_id: patient.county_id?.toString() || '',
        sub_county_id: patient.sub_county_id?.toString() || '',
        notes: patient.notes || '',
        emergency_contacts: patient.emergencyContacts || [],
        identifiers: patient.identifiers || [],
        allergies: patient.allergies || [],
        chronic_conditions: patient.chronicConditions || [],
        relationships: patient.relationships || [],
        alerts: patient.alerts || [],
    });

    const handleCountyChange = (countyId: string) => {
        setData('county_id', countyId);
        setData('sub_county_id', '');
        setSelectedCounty(Number(countyId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/patients/${patient.id}`);
    };

    return (
        <>
            <Head title={`Edit ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
                        <p className="text-muted-foreground">
                            Update patient information.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AlertError errors={errors} />

                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="other_names">Other Names</Label>
                                        <Input
                                            id="other_names"
                                            value={data.other_names}
                                            onChange={(e) => setData('other_names', e.target.value)}
                                        />
                                        <InputError message={errors.other_names} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender_id">Gender</Label>
                                        <select
                                            id="gender_id"
                                            value={data.gender_id}
                                            onChange={(e) => setData('gender_id', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select gender</option>
                                            {genders.map((gender) => (
                                                <option key={gender.id} value={gender.id}>
                                                    {gender.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.gender_id} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                        />
                                        <InputError message={errors.date_of_birth} />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Contact Information
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Address Information
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="county_id">County</Label>
                                        <select
                                            id="county_id"
                                            value={data.county_id}
                                            onChange={(e) => handleCountyChange(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select county</option>
                                            {counties.map((county) => (
                                                <option key={county.id} value={county.id}>
                                                    {county.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.county_id} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sub_county_id">Sub County</Label>
                                        <select
                                            id="sub_county_id"
                                            value={data.sub_county_id}
                                            onChange={(e) => setData('sub_county_id', e.target.value)}
                                            disabled={!selectedCounty}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select sub-county</option>
                                            {(() => {
                                                const county = counties.find((c) => c.id === selectedCounty);
                                                return county && county.sub_counties
                                                    ? county.sub_counties.map((subCounty) => (
                                                        <option key={subCounty.id} value={subCounty.id}>
                                                            {subCounty.name}
                                                        </option>
                                                    ))
                                                    : null;
                                            })()}
                                        </select>
                                        <InputError message={errors.sub_county_id} />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Additional Information
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Emergency Contacts
                                </h3>
                                <div className="space-y-2">
                                    {data.emergency_contacts.map((contact: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Contact {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.emergency_contacts];
                                                        updated.splice(index, 1);
                                                        setData('emergency_contacts', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div>
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={contact.name || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.emergency_contacts];
                                                            updated[index].name = e.target.value;
                                                            setData('emergency_contacts', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Relationship</Label>
                                                    <Input
                                                        value={contact.relationship || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.emergency_contacts];
                                                            updated[index].relationship = e.target.value;
                                                            setData('emergency_contacts', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <Input
                                                        value={contact.phone || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.emergency_contacts];
                                                            updated[index].phone = e.target.value;
                                                            setData('emergency_contacts', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Address</Label>
                                                    <Input
                                                        value={contact.address || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.emergency_contacts];
                                                            updated[index].address = e.target.value;
                                                            setData('emergency_contacts', updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setData('emergency_contacts', [
                                                ...data.emergency_contacts,
                                                { name: '', relationship: '', phone: '', address: '' }
                                            ]);
                                        }}
                                    >
                                        Add Emergency Contact
                                    </Button>
                                </div>
                            </div>

                            {/* Patient Identifiers */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Patient Identifiers
                                </h3>
                                <div className="space-y-2">
                                    {data.identifiers.map((identifier: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Identifier {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.identifiers];
                                                        updated.splice(index, 1);
                                                        setData('identifiers', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div>
                                                    <Label>Type</Label>
                                                    <Input
                                                        value={identifier.identifier_type || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.identifiers];
                                                            updated[index].identifier_type = e.target.value;
                                                            setData('identifiers', updated);
                                                        }}
                                                        placeholder="e.g., National ID, Passport"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Value</Label>
                                                    <Input
                                                        value={identifier.identifier_value || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.identifiers];
                                                            updated[index].identifier_value = e.target.value;
                                                            setData('identifiers', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`primary-${index}`}
                                                        checked={identifier.is_primary || false}
                                                        onChange={(e) => {
                                                            const updated = [...data.identifiers];
                                                            updated[index].is_primary = e.target.checked;
                                                            setData('identifiers', updated);
                                                        }}
                                                    />
                                                    <Label htmlFor={`primary-${index}`}>Primary</Label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setData('identifiers', [
                                                ...data.identifiers,
                                                { identifier_type: '', identifier_value: '', is_primary: false }
                                            ]);
                                        }}
                                    >
                                        Add Identifier
                                    </Button>
                                </div>
                            </div>

                            {/* Allergies */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Allergies
                                </h3>
                                <div className="space-y-2">
                                    {data.allergies.map((allergy: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Allergy {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.allergies];
                                                        updated.splice(index, 1);
                                                        setData('allergies', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div>
                                                    <Label>Allergen</Label>
                                                    <Input
                                                        value={allergy.allergen || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.allergies];
                                                            updated[index].allergen = e.target.value;
                                                            setData('allergies', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Severity</Label>
                                                    <select
                                                        value={allergy.severity || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.allergies];
                                                            updated[index].severity = e.target.value;
                                                            setData('allergies', updated);
                                                        }}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Select severity</option>
                                                        <option value="mild">Mild</option>
                                                        <option value="moderate">Moderate</option>
                                                        <option value="severe">Severe</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Reaction</Label>
                                                    <Input
                                                        value={allergy.reaction || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.allergies];
                                                            updated[index].reaction = e.target.value;
                                                            setData('allergies', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`allergy-active-${index}`}
                                                        checked={allergy.is_active !== false}
                                                        onChange={(e) => {
                                                            const updated = [...data.allergies];
                                                            updated[index].is_active = e.target.checked;
                                                            setData('allergies', updated);
                                                        }}
                                                    />
                                                    <Label htmlFor={`allergy-active-${index}`}>Active</Label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setData('allergies', [
                                                ...data.allergies,
                                                { allergen: '', severity: '', reaction: '', is_active: true }
                                            ]);
                                        }}
                                    >
                                        Add Allergy
                                    </Button>
                                </div>
                            </div>

                            {/* Chronic Conditions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Chronic Conditions
                                </h3>
                                <div className="space-y-2">
                                    {data.chronic_conditions.map((condition: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Condition {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.chronic_conditions];
                                                        updated.splice(index, 1);
                                                        setData('chronic_conditions', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div>
                                                    <Label>Condition Name</Label>
                                                    <Input
                                                        value={condition.condition_name || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.chronic_conditions];
                                                            updated[index].condition_name = e.target.value;
                                                            setData('chronic_conditions', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Status</Label>
                                                    <Input
                                                        value={condition.status || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.chronic_conditions];
                                                            updated[index].status = e.target.value;
                                                            setData('chronic_conditions', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Diagnosis Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={condition.diagnosed_on || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.chronic_conditions];
                                                            updated[index].diagnosed_on = e.target.value;
                                                            setData('chronic_conditions', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`condition-active-${index}`}
                                                        checked={condition.is_active !== false}
                                                        onChange={(e) => {
                                                            const updated = [...data.chronic_conditions];
                                                            updated[index].is_active = e.target.checked;
                                                            setData('chronic_conditions', updated);
                                                        }}
                                                    />
                                                    <Label htmlFor={`condition-active-${index}`}>Active</Label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setData('chronic_conditions', [
                                                ...data.chronic_conditions,
                                                { condition_name: '', status: '', diagnosed_on: '', is_active: true }
                                            ]);
                                        }}
                                    >
                                        Add Chronic Condition
                                    </Button>
                                </div>
                            </div>

                            {/* Family Relationships */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Family Relationships
                                </h3>
                                <div className="space-y-2">
                                    {data.relationships.map((rel: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Relationship {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.relationships];
                                                        updated.splice(index, 1);
                                                        setData('relationships', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div>
                                                    <Label>Relationship Type</Label>
                                                    <Input
                                                        value={rel.relationship_type || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.relationships];
                                                            updated[index].relationship_type = e.target.value;
                                                            setData('relationships', updated);
                                                        }}
                                                        placeholder="e.g., Mother, Father, Spouse"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Related Patient Name</Label>
                                                    <Input
                                                        value={rel.related_patient ? `${rel.related_patient.first_name} ${rel.related_patient.last_name}` : ''}
                                                        disabled
                                                        placeholder="Search and select patient"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`kin-${index}`}
                                                        checked={rel.is_next_of_kin || false}
                                                        onChange={(e) => {
                                                            const updated = [...data.relationships];
                                                            updated[index].is_next_of_kin = e.target.checked;
                                                            setData('relationships', updated);
                                                        }}
                                                    />
                                                    <Label htmlFor={`kin-${index}`}>Next of Kin</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`emergency-${index}`}
                                                        checked={rel.is_emergency_contact || false}
                                                        onChange={(e) => {
                                                            const updated = [...data.relationships];
                                                            updated[index].is_emergency_contact = e.target.checked;
                                                            setData('relationships', updated);
                                                        }}
                                                    />
                                                    <Label htmlFor={`emergency-${index}`}>Emergency Contact</Label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setData('relationships', [
                                                ...data.relationships,
                                                { relationship_type: '', related_patient_id: null, is_next_of_kin: false, is_emergency_contact: false }
                                            ]);
                                        }}
                                    >
                                        Add Family Relationship
                                    </Button>
                                </div>
                            </div>

                            {/* Patient Alerts */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Patient Alerts
                                </h3>
                                <div className="space-y-2">
                                    {data.alerts.map((alert: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Alert {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.alerts];
                                                        updated.splice(index, 1);
                                                        setData('alerts', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div>
                                                    <Label>Type</Label>
                                                    <Input
                                                        value={alert.type || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].type = e.target.value;
                                                            setData('alerts', updated);
                                                        }}
                                                        placeholder="e.g., Medication, Clinical"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Severity</Label>
                                                    <select
                                                        value={alert.severity || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].severity = e.target.value;
                                                            setData('alerts', updated);
                                                        }}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Select severity</option>
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                        <option value="critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={alert.title || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].title = e.target.value;
                                                            setData('alerts', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Message</Label>
                                                    <textarea
                                                        value={alert.message || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].message = e.target.value;
                                                            setData('alerts', updated);
                                                        }}
                                                        rows={2}
                                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={alert.starts_at || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].starts_at = e.target.value;
                                                            setData('alerts', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>End Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={alert.ends_at || ''}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].ends_at = e.target.value;
                                                            setData('alerts', updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`alert-active-${index}`}
                                                        checked={alert.is_active !== false}
                                                        onChange={(e) => {
                                                            const updated = [...data.alerts];
                                                            updated[index].is_active = e.target.checked;
                                                            setData('alerts', updated);
                                                        }}
                                                    />
                                                    <Label htmlFor={`alert-active-${index}`}>Active</Label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setData('alerts', [
                                                ...data.alerts,
                                                { type: '', severity: '', title: '', message: '', starts_at: '', ends_at: '', is_active: true }
                                            ]);
                                        }}
                                    >
                                        Add Alert
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/patients/${patient.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Patient'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
