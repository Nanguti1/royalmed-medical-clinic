import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Upload, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { DentalAttachment } from '@/types/dental';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    attachments: DentalAttachment[];
};

export default function DentalAttachments() {
    const { patient, attachments } = usePage<PageProps>().props;

    return (
        <>
            <Head title={`Dental Attachments - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Dental Attachments</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Attachment
                    </Button>
                </div>

                {/* Attachments */}
                {attachments.length === 0 ? (
                    <EmptyState
                        icon={ImageIcon}
                        title="No attachments found"
                        description="Upload dental images, X-rays, or other attachments."
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {attachments.map((attachment) => (
                            <AttachmentCard key={attachment.id} attachment={attachment} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function AttachmentCard({ attachment }: { attachment: DentalAttachment }) {
    const fileSize = (attachment.file_size / 1024).toFixed(2);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg truncate">{attachment.file_name}</CardTitle>
                    <Badge variant="outline">{attachment.attachment_type}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Size: {fileSize} KB</p>
                    <p className="text-muted-foreground">Type: {attachment.file_type}</p>
                    {attachment.description && (
                        <p className="text-muted-foreground">{attachment.description}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                            <a href={attachment.file_path} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                        <Button size="sm" variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
