import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Search, User, AlertTriangle, Shield, Heart } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { PermissionGuard } from '@/components/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/types/patient';

type PageProps = {
    patients: {
        data: Patient[];
        links: any;
        meta: any;
    };
    search: string;
};

export default function PatientIndex() {
    const { patients, search } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: search,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/patients', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Patients" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                        <p className="text-muted-foreground">
                            Manage patient records and search for patients.
                        </p>
                    </div>
                    <PermissionGuard permission="patients.create" fallback={null}>
                        <Button asChild>
                            <a href="/patients/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Register Patient
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, hospital number, phone, or identifier..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Patient List */}
                {processing ? (
                    <LoadingState count={5} />
                ) : patients.data.length === 0 ? (
                    <EmptyState
                        icon={User}
                        title="No patients found"
                        description={search ? 'Try adjusting your search terms.' : 'Get started by registering your first patient.'}
                        action={!search ? {
                            label: 'Register Patient',
                            onClick: () => (window.location.href = '/patients/create'),
                        } : undefined}
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {patients.data.map((patient) => (
                                <PatientCard key={patient.id} patient={patient} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {patients.links && patients.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {patients.links.map((link: any, index: number) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function PatientCard({ patient }: { patient: Patient }) {
    const fullName = [patient.first_name, patient.other_names, patient.last_name]
        .filter(Boolean)
        .join(' ');

    const hasAlerts = patient.activeAlerts && patient.activeAlerts.length > 0;
    const hasAllergies = patient.activeAllergies && patient.activeAllergies.length > 0;
    const hasChronicConditions = patient.activeChronicConditions && patient.activeChronicConditions.length > 0;

    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/patients/${patient.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{fullName}</CardTitle>
                    {hasAlerts && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Alert
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{patient.hospital_number}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 text-sm">
                    {patient.phone && (
                        <p className="text-muted-foreground">{patient.phone}</p>
                    )}
                    {patient.email && (
                        <p className="text-muted-foreground">{patient.email}</p>
                    )}
                    {patient.gender && (
                        <p className="text-muted-foreground">{patient.gender.name}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                        {hasAllergies && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Allergies
                            </Badge>
                        )}
                        {hasChronicConditions && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                Chronic
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
