import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, FileText, Edit, Trash2, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/empty-state';
import type { ConsultationTemplate } from '@/types/visit';

type PageProps = {
    templates: {
        data: ConsultationTemplate[];
        links: any;
        meta: any;
    };
    search: string;
    category: string;
    categories: string[];
};

export default function ConsultationTemplatesIndex() {
    const { templates, search, category, categories } = usePage<PageProps>().props;

    const { data, setData, get, processing } = useForm({
        search: search,
        category: category,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/consultations/templates', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = (newCategory: string) => {
        setData('category', newCategory);
        get('/consultations/templates', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (templateId: number) => {
        if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            router.delete(`/consultations/templates/${templateId}`, {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    return (
        <>
            <Head title="Consultation Templates" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Consultation Templates</h1>
                        <p className="text-muted-foreground">
                            Manage reusable consultation note templates
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/consultations/templates/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </a>
                    </Button>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search templates..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>
                            <div className="flex gap-2">
                                <Button
                                    variant={category === '' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFilter('')}
                                >
                                    All
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat}
                                        variant={category === cat ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleFilter(cat)}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Templates List */}
                {processing ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading templates...</p>
                    </div>
                ) : templates.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No templates found"
                        description={search || category ? 'Try adjusting your search or filters.' : 'Get started by creating your first consultation template.'}
                        action={!search && !category ? {
                            label: 'Create Template',
                            onClick: () => (window.location.href = '/consultations/templates/create'),
                        } : undefined}
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.data.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
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
            </div>
        </>
    );
}

function TemplateCard({ template, onDelete }: { template: ConsultationTemplate; onDelete: (id: number) => void }) {
    const hasContent = template.chief_complaint_template || 
                     template.history_template || 
                     template.examination_template || 
                     template.plan_template;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.category && (
                            <Badge variant="secondary" className="mt-2">
                                {template.category}
                            </Badge>
                        )}
                    </div>
                    {!template.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                    )}
                </div>
                {template.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {template.description}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    {template.chief_complaint_template && (
                        <div className="text-xs text-muted-foreground">
                            ✓ Chief Complaint
                        </div>
                    )}
                    {template.history_template && (
                        <div className="text-xs text-muted-foreground">
                            ✓ History
                        </div>
                    )}
                    {template.examination_template && (
                        <div className="text-xs text-muted-foreground">
                            ✓ Examination
                        </div>
                    )}
                    {template.plan_template && (
                        <div className="text-xs text-muted-foreground">
                            ✓ Plan
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={`/consultations/templates/${template.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={`/consultations/templates/${template.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </a>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(template.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}