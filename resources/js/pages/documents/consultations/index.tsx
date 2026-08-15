import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Document } from '@/types/document';

type PageProps = {
    consultation: {
        id: number;
        consultation_date: string;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            hospital_number: string;
        };
    };
    documents: Document[];
};

export default function ConsultationDocuments() {
    const { consultation, documents } = usePage<PageProps>().props;

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
            <Head title={`Consultation Documents`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/consultations/${consultation.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Consultation Documents</h1>
                        <p className="text-muted-foreground">
                            {consultation.patient.first_name} {consultation.patient.last_name} - {new Date(consultation.consultation_date).toLocaleDateString()}
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/documents/upload">
                            <FileText className="mr-2 h-4 w-4" />
                            Upload Document
                        </a>
                    </Button>
                </div>

                {documents.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No documents found"
                        description="This consultation has no attached documents."
                    />
                ) : (
                    <div className="grid gap-4">
                        {documents.map((doc) => (
                            <DocumentCard key={doc.id} document={doc} getCategoryColor={getCategoryColor} formatFileSize={formatFileSize} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function DocumentCard({ document, getCategoryColor, formatFileSize }: { document: Document; getCategoryColor: (category: string) => string; formatFileSize: (bytes: number) => string }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => (window.location.href = `/documents/${document.id}`)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{document.file_name}</p>
                    </div>
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
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(document.category)}>
                            {document.category}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-muted-foreground">Size: {formatFileSize(document.file_size)}</p>
                </div>
            </CardContent>
        </Card>
    );
}
