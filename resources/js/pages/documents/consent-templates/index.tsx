import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Plus, FileText } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { ConsentTemplate } from '@/types/document';

type PageProps = {
    templates: {
        data: ConsentTemplate[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
    };
};

export default function ConsentTemplatesIndex() {
    const { templates, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/documents/consent-templates', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Consent Templates" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Consent Templates</h1>
                        <p className="text-muted-foreground">Manage consent form templates.</p>
                    </div>
                    <Button asChild>
                        <a href="/documents/consent-templates/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Template
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or description..."
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
                ) : templates.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No templates found"
                        description="Try adjusting your search terms or create a new template."
                        action={{
                            label: 'New Template',
                            onClick: () => (window.location.href = '/documents/consent-templates/create'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4">
                            {templates.data.map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                        </div>
                        {templates.links && templates.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {templates.links.map((link: any, index: number) => (
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

function TemplateCard({ template }: { template: ConsentTemplate }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/documents/consent-templates/${template.id}/edit`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                    </div>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    {template.description && (
                        <p className="text-muted-foreground">{template.description}</p>
                    )}
                    <div className="flex gap-2">
                        {template.requires_witness && <Badge variant="outline">Requires Witness</Badge>}
                        {template.requires_signature && <Badge variant="outline">Requires Signature</Badge>}
                    </div>
                    {template.expiry_days && (
                        <p className="text-muted-foreground">Expires after {template.expiry_days} days</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
