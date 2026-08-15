import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import { User, Camera, MapPin, Phone, Mail, Calendar, Lock, Save } from 'lucide-react';
import type { PatientPortalUser, ProfileFormData } from '@/types/portal';

type PageProps = {
    user: PatientPortalUser;
};

export default function PatientProfile() {
    const { user } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm<ProfileFormData>({
        first_name: user.first_name,
        last_name: user.last_name,
        other_names: user.other_names || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        blood_type: user.blood_type || '',
        allergies: user.allergies || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portal/patient/profile');
    };

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <>
            <Head title="My Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your personal information
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Picture */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Picture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="h-32 w-32 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-16 w-16 text-primary" />
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                JPG, PNG or GIF (Max 2MB)
                            </p>
                        </CardContent>
                    </Card>

                    {/* Profile Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AlertError errors={errors} />

                                {/* Personal Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Personal Details</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.first_name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name *</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.last_name} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="other_names">Other Names</Label>
                                            <Input
                                                id="other_names"
                                                value={data.other_names}
                                                onChange={(e) => setData('other_names', e.target.value)}
                                                placeholder="Middle names"
                                            />
                                            <InputError message={errors.other_names} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">Contact admin to change email</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Medical Information</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={formatDateForInput(data.date_of_birth)}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                max={getTodayDate()}
                                            />
                                            <InputError message={errors.date_of_birth} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <select
                                                id="gender"
                                                value={data.gender}
                                                onChange={(e) => setData('gender', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <InputError message={errors.gender} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="blood_type">Blood Type</Label>
                                            <select
                                                id="blood_type"
                                                value={data.blood_type}
                                                onChange={(e) => setData('blood_type', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <option value="">Select blood type</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                            <InputError message={errors.blood_type} />
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <Label htmlFor="allergies">Allergies</Label>
                                            <Input
                                                id="allergies"
                                                value={data.allergies}
                                                onChange={(e) => setData('allergies', e.target.value)}
                                                placeholder="List any known allergies (medications, food, etc.)"
                                            />
                                            <InputError message={errors.allergies} />
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Emergency Contact</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_contact_name">Contact Name</Label>
                                            <Input
                                                id="emergency_contact_name"
                                                value={data.emergency_contact_name}
                                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                placeholder="Full name"
                                            />
                                            <InputError message={errors.emergency_contact_name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                                            <Input
                                                id="emergency_contact_phone"
                                                type="tel"
                                                value={data.emergency_contact_phone}
                                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            <InputError message={errors.emergency_contact_phone} />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Address</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address">Street Address</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="123 Main Street"
                                            />
                                            <InputError message={errors.address} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="City"
                                            />
                                            <InputError message={errors.city} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State/Province</Label>
                                            <Input
                                                id="state"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                placeholder="State"
                                            />
                                            <InputError message={errors.state} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={data.country}
                                                onChange={(e) => setData('country', e.target.value)}
                                                placeholder="Country"
                                            />
                                            <InputError message={errors.country} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="postal_code">Postal Code</Label>
                                            <Input
                                                id="postal_code"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                placeholder="12345"
                                            />
                                            <InputError message={errors.postal_code} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <a href="/portal/patient/dashboard">Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Account Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">Last changed: Never</p>
                            </div>
                            <Button variant="outline" asChild>
                                <a href="/portal/patient/password">
                                    Change Password
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
