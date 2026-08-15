import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Upload, FileText, Download, Trash2, Plus, X } from 'lucide-react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Consultation, ConsultationAttachment } from '@/types/visit';
import { useState } from 'react';

type PageProps = {
    consultation: Consultation;
    attachments: ConsultationAttachment[];
};

export default function ConsultationAttachments() {
    const { consultation, attachments } = usePage<PageProps>().props;
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
        description: '',
    });

    const patientName = consultation.visit?.patient
        ? [consultation.visit.patient.first_name, consultation.visit.patient.other_names, consultation.visit.patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

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
        formData.append('consultation_id', consultation.id.toString());

        post(`/consultations/${consultation.id}/attachments`, {
            data: formData,
            onSuccess: () => {
                setFile(null);
                setDescription('');
                setData('file', null);
                setData('description', '');
            },
        });
    };

    const handleDelete = (attachmentId: number) => {
        if (confirm('Are you sure you want to delete this attachment? This action cannot be undone.')) {
            window.location.href = `/consultations/${consultation.id}/attachments/${attachmentId}`;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('video')) return '🎥';
        return '📎';
    };

    return (
        <>
            <Head title={`Clinical Attachments - ${patientName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/consultations/${consultation.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clinical Attachments</h1>
                        <p className="text-muted-foreground">
                            Manage attachments for consultation with {patientName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Upload Form */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Attachment
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
                                                        Images, PDFs, documents
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
                                        placeholder="Brief description of the attachment..."
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-800 dark:text-blue-200">
                                        <strong>Supported formats:</strong> Images (JPG, PNG), PDF, Word documents, Excel files. Maximum file size: 10MB.
                                    </p>
                                </div>

                                <Button type="submit" disabled={processing || !file} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing ? 'Uploading...' : 'Upload Attachment'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Attachments List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Attachments ({attachments.length})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {attachments.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No attachments yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Upload clinical images, documents, or other files
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {attachments.map((attachment) => (
                                        <AttachmentCard
                                            key={attachment.id}
                                            attachment={attachment}
                                            onDelete={handleDelete}
                                        />
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

function AttachmentCard({ attachment, onDelete }: { attachment: ConsultationAttachment; onDelete: (id: number) => void }) {
    const getFileIcon = (fileType: string) => {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('video')) return '🎥';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="text-2xl">{getFileIcon(attachment.file_type)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{attachment.file_name}</p>
                            {attachment.description && (
                                <p className="text-sm text-muted-foreground truncate">{attachment.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {attachment.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.file_size)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(attachment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={attachment.file_path} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(attachment.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}