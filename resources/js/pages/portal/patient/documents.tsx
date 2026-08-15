import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import {
    FileText,
    Upload,
    Download,
    Trash2,
    Search,
    Filter,
    X,
    File,
    Image as ImageIcon,
} from 'lucide-react';
import type { PortalDocument } from '@/types/portal';
import { useState } from 'react';

type PageProps = {
    documents: PortalDocument[];
    filters: {
        document_type?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function PatientDocuments() {
    const { documents, filters } = usePage<PageProps>().props;
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
        description: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setData('file', selectedFile);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
        setData('description', e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        if (data.file) {
            formData.append('file', data.file);
        }
        formData.append('description', data.description);

        post('/portal/patient/documents', {
            data: formData,
            onSuccess: () => {
                setFile(null);
                setDescription('');
                setData('file', null);
                setData('description', '');
            },
        });
    };

    const handleDelete = (documentId: number) => {
        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            window.location.href = `/portal/patient/documents/${documentId}`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
            return <ImageIcon className="h-5 w-5" />;
        }
        if (['pdf'].includes(extension || '')) {
            return <FileText className="h-5 w-5" />;
        }
        return <File className="h-5 w-5" />;
    };

    const clearFilters = () => {
        window.location.href = '/portal/patient/documents';
    };

    return (
        <>
            <Head title="My Documents" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
                        <p className="text-muted-foreground">
                            View and manage your medical documents
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Upload Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Document
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AlertError errors={errors} />

                                <div className="space-y-2">
                                    <Label htmlFor="file">File</Label>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
                                        <input
                                            id="file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file"
                                            className="cursor-pointer"
                                        >
                                            {file ? (
                                                <div className="space-y-2">
                                                    <FileText className="h-8 w-8 mx-auto text-primary" />
                                                    <p className="text-sm font-medium">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Click to browse or drag and drop
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        PDF, Images, Documents (Max 10MB)
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <InputError message={errors.file} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                        placeholder="Brief description of the document..."
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <Button type="submit" disabled={processing || !file} className="w-full">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Documents List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Documents ({documents.length})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-4 space-y-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search documents..."
                                            className="pl-9"
                                        />
                                    </div>
                                    <select
                                        className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        defaultValue={filters.document_type || ''}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            if (e.target.value) {
                                                url.searchParams.set('document_type', e.target.value);
                                            } else {
                                                url.searchParams.delete('document_type');
                                            }
                                            window.location.href = url.toString();
                                        }}
                                    >
                                        <option value="">All Types</option>
                                        <option value="lab_report">Lab Report</option>
                                        <option value="prescription">Prescription</option>
                                        <option value="imaging">Imaging</option>
                                        <option value="discharge_summary">Discharge Summary</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {(filters.document_type || filters.date_from || filters.date_to) && (
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            {documents.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No documents yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Upload your medical documents here
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {documents.map((document) => (
                                        <Card key={document.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                            {getFileIcon(document.file_name)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{document.file_name}</p>
                                                            {document.description && (
                                                                <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {document.document_type}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatFileSize(document.file_size)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(document.upload_date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={document.file_path} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(document.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
