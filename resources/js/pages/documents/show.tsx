import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Clock, Shield, AlertTriangle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/types/document';

type PageProps = {
    document: Document;
};

export default function DocumentShow() {
    const { document } = usePage<PageProps>().props;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'medical':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'lab':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'radiology':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'consent':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'insurance':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'legal':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={document.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/documents">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
                        <p className="text-muted-foreground">{document.file_name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href={`/documents/${document.id}/versions`}>
                                <History className="mr-2 h-4 w-4" />
                                Versions
                            </a>
                        </Button>
                        <Button asChild>
                            <a href={document.file_path} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Uploaded:</span>
                                <span>{new Date(document.uploaded_at).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="font-medium">Size:</span>
                                <span className="ml-2">{formatFileSize(document.file_size)}</span>
                            </div>
                            <div>
                                <span className="font-medium">Type:</span>
                                <span className="ml-2">{document.file_type.toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="font-medium">MIME Type:</span>
                                <span className="ml-2">{document.mime_type}</span>
                            </div>
                            {document.expires_at && (
                                <div>
                                    <span className="font-medium">Expires:</span>
                                    <span className="ml-2">{new Date(document.expires_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Classification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className={getCategoryColor(document.category)}>
                                    {document.category}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
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
                            {document.description && (
                                <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="text-muted-foreground mt-1">{document.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {document.patient && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="font-medium">
                                    {document.patient.first_name} {document.patient.last_name}
                                </p>
                                <p className="text-muted-foreground">{document.patient.hospital_number}</p>
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                    <a href={`/patients/${document.patient.id}`}>
                                        View Patient Profile
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {document.uploadedBy && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded By</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{document.uploadedBy.name}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
