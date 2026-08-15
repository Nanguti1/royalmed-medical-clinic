import { AlertTriangle, User, Phone, Mail, Calendar, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Patient, DuplicateWarningProps } from '@/types/patient';

export default function DuplicateWarning({
    isOpen,
    onClose,
    duplicates,
    onContinueAnyway,
    onSelectDuplicate,
}: DuplicateWarningProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="h-5 w-5" />
                            Potential Duplicate Patients Detected
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        We found {duplicates.length} existing patient(s) that may match the information you entered. 
                        Please review them before creating a new record.
                    </p>

                    <div className="space-y-3">
                        {duplicates.map((duplicate) => {
                            const fullName = [duplicate.first_name, duplicate.other_names, duplicate.last_name]
                                .filter(Boolean)
                                .join(' ');

                            return (
                                <Card key={duplicate.id} className="border-orange-200 dark:border-orange-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{fullName}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {duplicate.hospital_number}
                                                    </Badge>
                                                </div>
                                                
                                                {duplicate.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {duplicate.phone}
                                                    </div>
                                                )}
                                                
                                                {duplicate.email && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {duplicate.email}
                                                    </div>
                                                )}
                                                
                                                {duplicate.date_of_birth && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        DOB: {new Date(duplicate.date_of_birth).toLocaleDateString()}
                                                    </div>
                                                )}

                                                {(duplicate.activeAllergies && duplicate.activeAllergies.length > 0) && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Badge variant="destructive" className="text-xs">
                                                            {duplicate.activeAllergies.length} Allergies
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onSelectDuplicate(duplicate.id)}
                                                className="shrink-0"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Use This
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                <strong>Recommendation:</strong> If any of the patients above are the same person, 
                                select "Use This" to avoid creating duplicate records.
                            </p>
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={onClose}>
                                Go Back
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={onContinueAnyway}
                                className="gap-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Create Anyway
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}