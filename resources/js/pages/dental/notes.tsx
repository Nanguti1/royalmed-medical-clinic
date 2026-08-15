import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/empty-state';
import type { DentalNote } from '@/types/dental';

type PageProps = {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    notes: DentalNote[];
};

export default function DentalNotes() {
    const { patient, notes } = usePage<PageProps>().props;

    return (
        <>
            <Head title={`Dental Notes - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/patients/${patient.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Dental Notes</h1>
                        <p className="text-muted-foreground">
                            {patient.first_name} {patient.last_name} ({patient.hospital_number})
                        </p>
                    </div>
                    <Button asChild>
                        <a href="#">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Note
                        </a>
                    </Button>
                </div>

                {/* Notes */}
                {notes.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No notes found"
                        description="Add dental notes for this patient."
                    />
                ) : (
                    <div className="space-y-4">
                        {notes.map((note) => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function NoteCard({ note }: { note: DentalNote }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                        <Badge variant="outline">{note.note_type}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{note.note}</p>
            </CardContent>
        </Card>
    );
}
