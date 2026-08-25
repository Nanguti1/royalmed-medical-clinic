import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Upload, FileText, Shield, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Document } from '@/types/document';

type PageProps = {
    documents: {
        data: Document[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        category?: string;
    };
};

export default function DocumentsIndex() {
    const { documents, filters } = usePage<PageProps>().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        category: filters.category || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/documents', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Documents" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Documents Library</h1>
                        <p className="text-muted-foreground">Manage and organize documents.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/documents/consent-templates">
                                Consent Templates
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/documents/upload">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </a>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title or description..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="w-40">
                                <Select
                                    value={data.category}
                                    onValueChange={(value) => setData('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All categories</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="medical">Medical</SelectItem>
                                        <SelectItem value="lab">Lab</SelectItem>
                                        <SelectItem value="radiology">Radiology</SelectItem>
                                        <SelectItem value="consent">Consent</SelectItem>
                                        <SelectItem value="insurance">Insurance</SelectItem>
                                        <SelectItem value="legal">Legal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing}>Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {processing ? (
                    <LoadingState count={5} />
                ) : documents.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No documents found"
                        description="Try adjusting your search terms or upload a new document."
                        action={{
                            label: 'Upload Document',
                            onClick: () => (window.location.href = '/documents/upload'),
                        }}
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {documents.data.map((doc) => (
                                <DocumentCard key={doc.id} document={doc} />
                            ))}
                        </div>
                        {documents.links && documents.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {documents.links.map((link: any, index: number) => (
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

function DocumentCard({ document }: { document: Document }) {
    const getCategoryColor = () => {
        switch (document.category) {
            case 'medical':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'lab':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'radiology':
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
            case 'consent':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'insurance':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'legal':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/documents/${document.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    <div className="flex gap-2">
                        {document.is_sensitive && (
                            <Badge variant="destructive">
                                <Shield className="mr-1 h-3 w-3" />
                                Sensitive
                            </Badge>
                        )}
                        {document.is_confidential && (
                            <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Confidential
                            </Badge>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">Document #{document.id}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 text-sm">
                    <Badge className={getCategoryColor()}>
                        {document.category}
                    </Badge>
                    <p className="text-muted-foreground">{document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-muted-foreground">{formatFileSize(document.file_size)}</p>
                    {document.patient && (
                        <p className="text-muted-foreground">{document.patient.first_name} {document.patient.last_name}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
