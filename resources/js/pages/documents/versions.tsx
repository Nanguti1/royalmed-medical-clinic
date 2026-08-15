import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Document, DocumentVersion } from '@/types/document';

type PageProps = {
    document: Document;
    versions: DocumentVersion[];
};

export default function DocumentVersions() {
    const { document, versions } = usePage<PageProps>().props;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <>
            <Head title={`Versions - ${document.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/documents/${document.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Document Versions</h1>
                        <p className="text-muted-foreground">{document.title}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">{document.file_name}</p>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Uploaded: {new Date(document.uploaded_at).toLocaleString()}</span>
                            </div>
                            <p className="text-muted-foreground">Size: {formatFileSize(document.file_size)}</p>
                        </div>
                    </CardContent>
                </Card>

                {versions.length === 0 ? (
                    <EmptyState
                        icon={History}
                        title="No previous versions"
                        description="This document has no version history."
                    />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Version History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {versions.map((version) => (
                                    <div key={version.id} className="p-4 border rounded">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium">{version.file_name}</p>
                                                <p className="text-sm text-muted-foreground">{version.file_type.toUpperCase()}</p>
                                            </div>
                                            <Badge>Version {version.id}</Badge>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{new Date(version.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-muted-foreground">Size: {formatFileSize(version.file_size)}</p>
                                            {version.version_notes && (
                                                <p className="text-muted-foreground">{version.version_notes}</p>
                                            )}
                                            {version.uploadedBy && (
                                                <p className="text-muted-foreground">Uploaded by: {version.uploadedBy.name}</p>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={version.file_path} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
