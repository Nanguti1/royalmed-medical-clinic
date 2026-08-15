import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    XCircle,
    CheckCircle,
    X,
    RefreshCw,
} from 'lucide-react';

type DrugInteraction = {
    id: string;
    severity: 'contraindicated' | 'severe' | 'moderate' | 'mild' | 'info';
    drug1: string;
    drug2: string;
    description: string;
    recommendation: string;
};

type DrugInteractionCheckerProps = {
    medications: Array<{
        id: number;
        name: string;
        generic_name?: string;
    }>;
    onAddToPrescription?: (medicationId: number) => void;
};

export function DrugInteractionChecker({ medications, onAddToPrescription }: DrugInteractionCheckerProps) {
    const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
    const [selectedMedications, setSelectedMedications] = useState<number[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    const checkInteractions = async () => {
        if (selectedMedications.length < 2) return;

        setIsChecking(true);
        // Simulate API call to check interactions
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock interaction data
        const mockInteractions: DrugInteraction[] = [
            {
                id: '1',
                severity: 'severe',
                drug1: medications.find(m => m.id === selectedMedications[0])?.name || 'Drug A',
                drug2: medications.find(m => m.id === selectedMedications[1])?.name || 'Drug B',
                description: 'Increased risk of bleeding when used together',
                recommendation: 'Monitor closely for signs of bleeding. Consider alternative therapy.',
            },
        ];

        setInteractions(mockInteractions);
        setIsChecking(false);
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'contraindicated':
                return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
            case 'severe':
                return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
            case 'moderate':
                return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
            case 'mild':
                return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
            case 'info':
                return <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
            default:
                return <CheckCircle className="h-5 w-5" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'contraindicated':
                return <Badge variant="destructive">Contraindicated</Badge>;
            case 'severe':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Severe</Badge>;
            case 'moderate':
                return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Moderate</Badge>;
            case 'mild':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Mild</Badge>;
            case 'info':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Info</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    };

    const toggleMedication = (medicationId: number) => {
        setSelectedMedications(prev => {
            if (prev.includes(medicationId)) {
                return prev.filter(id => id !== medicationId);
            }
            return [...prev, medicationId];
        });
        setInteractions([]);
    };

    const clearSelection = () => {
        setSelectedMedications([]);
        setInteractions([]);
    };

    const hasCriticalInteractions = interactions.some(i => i.severity === 'contraindicated' || i.severity === 'severe');

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Drug Interaction Checker
                    </CardTitle>
                    <div className="flex gap-2">
                        {selectedMedications.length > 0 && (
                            <Button variant="outline" size="sm" onClick={clearSelection}>
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                        {selectedMedications.length >= 2 && (
                            <Button size="sm" onClick={checkInteractions} disabled={isChecking}>
                                <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                                Check
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Medication Selection */}
                <div>
                    <p className="text-sm font-medium mb-2">Select medications to check for interactions</p>
                    <div className="flex flex-wrap gap-2">
                        {medications.map((medication) => (
                            <Button
                                key={medication.id}
                                variant={selectedMedications.includes(medication.id) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleMedication(medication.id)}
                            >
                                {medication.name}
                                {selectedMedications.includes(medication.id) && (
                                    <X className="h-3 w-3 ml-1" />
                                )}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Interaction Results */}
                {interactions.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {hasCriticalInteractions ? (
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ) : (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                            <p className="font-medium">
                                {interactions.length} interaction{interactions.length > 1 ? 's' : ''} found
                            </p>
                        </div>

                        {interactions.map((interaction) => (
                            <div
                                key={interaction.id}
                                className={`p-4 rounded-lg border ${
                                    interaction.severity === 'contraindicated' || interaction.severity === 'severe'
                                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                        : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {getSeverityIcon(interaction.severity)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="font-medium">
                                                {interaction.drug1} + {interaction.drug2}
                                            </p>
                                            {getSeverityBadge(interaction.severity)}
                                        </div>
                                        <p className="text-sm mb-2">{interaction.description}</p>
                                        <p className="text-sm font-medium">Recommendation: {interaction.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedMedications.length >= 2 && interactions.length === 0 && !isChecking && (
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <p className="font-medium">No interactions detected</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            The selected medications have no known interactions based on current data.
                        </p>
                    </div>
                )}

                {selectedMedications.length < 2 && (
                    <p className="text-sm text-muted-foreground">
                        Select at least 2 medications to check for interactions
                    </p>
                )}
            </CardContent>
        </Card>
    );
}