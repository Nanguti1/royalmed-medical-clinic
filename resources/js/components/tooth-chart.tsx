import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ToothCondition = 'healthy' | 'filling' | 'crown' | 'root-canal' | 'extraction' | 'missing' | 'decayed';

type ToothData = {
    number: number;
    quadrant: 'upper-right' | 'upper-left' | 'lower-right' | 'lower-left';
    condition: ToothCondition;
    notes?: string;
};

type ToothChartProps = {
    teeth?: ToothData[];
    onToothClick?: (tooth: ToothData) => void;
    onToothUpdate?: (toothNumber: number, condition: ToothCondition, notes?: string) => void;
    readOnly?: boolean;
};

const quadrants = {
    'upper-right': [18, 17, 16, 15, 14, 13, 12, 11],
    'upper-left': [21, 22, 23, 24, 25, 26, 27, 28],
    'lower-right': [48, 47, 46, 45, 44, 43, 42, 41],
    'lower-left': [31, 32, 33, 34, 35, 36, 37, 38],
};

const conditionColors: Record<ToothCondition, string> = {
    healthy: 'bg-green-100 border-green-500 dark:bg-green-900/20',
    filling: 'bg-blue-100 border-blue-500 dark:bg-blue-900/20',
    crown: 'bg-purple-100 border-purple-500 dark:bg-purple-900/20',
    'root-canal': 'bg-orange-100 border-orange-500 dark:bg-orange-900/20',
    extraction: 'bg-red-100 border-red-500 dark:bg-red-900/20',
    missing: 'bg-gray-200 border-gray-400 dark:bg-gray-700',
    decayed: 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/20',
};

const conditionLabels: Record<ToothCondition, string> = {
    healthy: 'Healthy',
    filling: 'Filling',
    crown: 'Crown',
    'root-canal': 'Root Canal',
    extraction: 'Extraction',
    missing: 'Missing',
    decayed: 'Decayed',
};

export function ToothChart({ teeth = [], onToothClick, onToothUpdate, readOnly = false }: ToothChartProps) {
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [selectedCondition, setSelectedCondition] = useState<ToothCondition>('healthy');

    const teethMap = new Map(teeth.map(t => [t.number, t]));

    const handleToothClick = (toothNumber: number) => {
        if (readOnly) return;
        setSelectedTooth(toothNumber);
        const toothData = teethMap.get(toothNumber);
        if (toothData) {
            setSelectedCondition(toothData.condition);
        }
        onToothClick?.(teethMap.get(toothNumber) || { number: toothNumber, quadrant: getQuadrantNumber(toothNumber), condition: 'healthy' });
    };

    const handleConditionChange = (condition: ToothCondition) => {
        setSelectedCondition(condition);
        if (selectedTooth && onToothUpdate) {
            onToothUpdate(selectedTooth, condition);
        }
    };

    const getQuadrantNumber = (toothNumber: number): ToothData['quadrant'] => {
        if (toothNumber >= 11 && toothNumber <= 18) return 'upper-right';
        if (toothNumber >= 21 && toothNumber <= 28) return 'upper-left';
        if (toothNumber >= 31 && toothNumber <= 38) return 'lower-left';
        if (toothNumber >= 41 && toothNumber <= 48) return 'lower-right';
        return 'upper-right';
    };

    const getToothCondition = (toothNumber: number): ToothCondition => {
        return teethMap.get(toothNumber)?.condition || 'healthy';
    };

    const renderTooth = (toothNumber: number) => {
        const condition = getToothCondition(toothNumber);
        const isSelected = selectedTooth === toothNumber;
        
        return (
            <button
                key={toothNumber}
                onClick={() => handleToothClick(toothNumber)}
                disabled={readOnly}
                className={`
                    relative w-12 h-16 rounded-lg border-2 flex flex-col items-center justify-center
                    transition-all hover:scale-105 active:scale-95
                    ${conditionColors[condition]}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${readOnly ? 'cursor-default' : 'cursor-pointer'}
                `}
            >
                <span className="text-xs font-bold">{toothNumber}</span>
                {condition !== 'healthy' && (
                    <div className="w-2 h-2 rounded-full bg-current mt-1" />
                )}
            </button>
        );
    };

    const renderQuadrant = (quadrant: keyof typeof quadrants, label: string) => (
        <div className="space-y-2">
            <div className="text-sm font-semibold text-center">{label}</div>
            <div className="flex gap-1 justify-center">
                {quadrants[quadrant].map(renderTooth)}
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Dental Chart</span>
                    {!readOnly && selectedTooth && (
                        <Badge variant="outline">Tooth {selectedTooth}</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Upper Arch */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Upper Arch</div>
                        <div className="flex justify-between gap-4">
                            {renderQuadrant('upper-right', 'Upper Right')}
                            {renderQuadrant('upper-left', 'Upper Left')}
                        </div>
                    </div>

                    {/* Lower Arch */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Lower Arch</div>
                        <div className="flex justify-between gap-4">
                            {renderQuadrant('lower-right', 'Lower Right')}
                            {renderQuadrant('lower-left', 'Lower Left')}
                        </div>
                    </div>

                    {/* Condition Legend */}
                    <div className="border-t pt-4">
                        <div className="text-sm font-medium mb-2">Legend</div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(conditionLabels).map(([condition, label]) => (
                                <Badge
                                    key={condition}
                                    variant="outline"
                                    className={`${conditionColors[condition as ToothCondition]}`}
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Condition Selector */}
                    {!readOnly && selectedTooth && (
                        <div className="border-t pt-4">
                            <div className="text-sm font-medium mb-2">Update Tooth {selectedTooth} Condition</div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(conditionLabels).map(([condition, label]) => (
                                    <Button
                                        key={condition}
                                        variant={selectedCondition === condition ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleConditionChange(condition as ToothCondition)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function useToothChart(initialTeeth: ToothData[] = []) {
    const [teeth, setTeeth] = useState<ToothData[]>(initialTeeth);

    const updateTooth = (toothNumber: number, condition: ToothCondition, notes?: string) => {
        setTeeth(prev => {
            const index = prev.findIndex(t => t.number === toothNumber);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], condition, notes };
                return updated;
            }
            return [
                ...prev,
                {
                    number: toothNumber,
                    quadrant: getQuadrantNumber(toothNumber),
                    condition,
                    notes,
                },
            ];
        });
    };

    const getTooth = (toothNumber: number) => {
        return teeth.find(t => t.number === toothNumber);
    };

    const clearTooth = (toothNumber: number) => {
        updateTooth(toothNumber, 'healthy');
    };

    const resetChart = () => {
        setTeeth([]);
    };

    return {
        teeth,
        updateTooth,
        getTooth,
        clearTooth,
        resetChart,
    };
}

function getQuadrantNumber(toothNumber: number): ToothData['quadrant'] {
    if (toothNumber >= 11 && toothNumber <= 18) return 'upper-right';
    if (toothNumber >= 21 && toothNumber <= 28) return 'upper-left';
    if (toothNumber >= 31 && toothNumber <= 38) return 'lower-left';
    if (toothNumber >= 41 && toothNumber <= 48) return 'lower-right';
    return 'upper-right';
}