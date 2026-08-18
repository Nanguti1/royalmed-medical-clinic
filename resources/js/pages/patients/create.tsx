import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Gender, Patient } from '@/types/patient';
import { useState } from 'react';
import DuplicateWarning from './duplicate-warning';

type PageProps = {
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
    potentialDuplicates?: Patient[];
};

export default function PatientCreate() {
    const { genders, counties, potentialDuplicates } = usePage<PageProps>().props;
    const { props } = usePage();
    const [selectedCounty, setSelectedCounty] = useState<number | ''>('');
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [checkedForDuplicates, setCheckedForDuplicates] = useState(false);

    // Check for flash data duplicates from backend
    const flashDuplicates = (props as any).duplicate_candidates as any[] || [];
    const hasFlashDuplicates = flashDuplicates.length > 0;

    // Check for flash error messages
    const flashError = (props as any).error as string | null;
    const flashWarning = (props as any).warning as string | null;

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        other_names: '',
        gender_id: '',
        date_of_birth: '',
        phone: '',
        email: '',
        address: '',
        county_id: '',
        sub_county_id: '',
        notes: '',
        confirm_duplicate: false,
    });

    const handleCountyChange = (countyId: string) => {
        setData('county_id', countyId);
        setData('sub_county_id', '');
        setSelectedCounty(Number(countyId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check for duplicates if not already checked
        if (!checkedForDuplicates && (potentialDuplicates && potentialDuplicates.length > 0 || hasFlashDuplicates)) {
            setShowDuplicateWarning(true);
            setCheckedForDuplicates(true);
            return;
        }
        
        post('/patients', {
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
        });
    };

    const handleContinueAnyway = () => {
        setShowDuplicateWarning(false);
        setData('confirm_duplicate', true);
        post('/patients');
    };

    const handleSelectDuplicate = (patientId: number) => {
        window.location.href = `/patients/${patientId}`;
    };

    return (
        <>
            <Head title="Register Patient" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/patients">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Register Patient</h1>
                        <p className="text-muted-foreground">
                            Add a new patient to the system.
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
                            {flashError && (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{flashError}</AlertDescription>
                                </Alert>
                            )}
                            {flashWarning && (
                                <Alert>
                                    <AlertCircle />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>{flashWarning}</AlertDescription>
                                </Alert>
                            )}
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

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/patients">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Registering...' : 'Register Patient'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Duplicate Warning Modal */}
                <DuplicateWarning
                    isOpen={showDuplicateWarning}
                    onClose={() => setShowDuplicateWarning(false)}
                    duplicates={hasFlashDuplicates ? flashDuplicates : (potentialDuplicates || [])}
                    onContinueAnyway={handleContinueAnyway}
                    onSelectDuplicate={handleSelectDuplicate}
                />
            </div>
        </>
    );
}
