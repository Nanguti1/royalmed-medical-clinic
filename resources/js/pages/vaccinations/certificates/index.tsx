import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, FileText, Download, Plus } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { VaccinationCertificate } from '@/types/vaccination';

type PageProps = {
    certificates: {
        data: VaccinationCertificate[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
    };
};

export default function CertificatesIndex() {
    const { certificates, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/vaccinations/certificates', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Vaccination Certificates" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Vaccination Certificates</h1>
                        <p className="text-muted-foreground">Manage vaccination certificates.</p>
                    </div>
                    <Button asChild>
                        <a href="/vaccinations">
                            <Plus className="mr-2 h-4 w-4" />
                            New Vaccination
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by patient name..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {processing ? (
                    <LoadingState count={5} />
                ) : certificates.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No certificates found"
                        description="Try adjusting your search terms."
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {certificates.data.map((cert) => (
                                <CertificateCard key={cert.id} certificate={cert} />
                            ))}
                        </div>
                        {certificates.links && certificates.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {certificates.links.map((link: any, index: number) => (
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

function CertificateCard({ certificate }: { certificate: VaccinationCertificate }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/vaccinations/certificates/${certificate.id}/print`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{certificate.certificate_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {certificate.patient?.first_name} {certificate.patient?.last_name}
                        </p>
                    </div>
                    <Badge variant="outline">Valid</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Valid From: {new Date(certificate.valid_from).toLocaleDateString()}</p>
                    {certificate.valid_until && (
                        <p className="text-muted-foreground">Valid Until: {new Date(certificate.valid_until).toLocaleDateString()}</p>
                    )}
                    <p className="text-muted-foreground">Issuing Authority: {certificate.issuing_authority}</p>
                    {certificate.vaccinationRecord?.vaccine && (
                        <p className="text-muted-foreground">Vaccine: {certificate.vaccinationRecord.vaccine.name}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
