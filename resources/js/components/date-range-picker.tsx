import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type DateRange = {
    start: string | null;
    end: string | null;
};

type PresetRange = {
    label: string;
    days: number;
};

const presetRanges: PresetRange[] = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This year', days: 365 },
];

type DateRangePickerProps = {
    startDate?: string;
    endDate?: string;
    onChange: (range: DateRange) => void;
    presets?: boolean;
    className?: string;
};

export function DateRangePicker({
    startDate,
    endDate,
    onChange,
    presets = true,
    className = '',
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [range, setRange] = useState<DateRange>({
        start: startDate || null,
        end: endDate || null,
    });

    const handleStartDateChange = (value: string) => {
        const newRange = { ...range, start: value };
        setRange(newRange);
        onChange(newRange);
    };

    const handleEndDateChange = (value: string) => {
        const newRange = { ...range, end: value };
        setRange(newRange);
        onChange(newRange);
    };

    const handlePresetClick = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        const newRange = {
            start: formatDate(start),
            end: formatDate(end),
        };
        setRange(newRange);
        onChange(newRange);
        setIsOpen(false);
    };

    const handleClear = () => {
        const newRange = { start: null, end: null };
        setRange(newRange);
        onChange(newRange);
    };

    const formatDateDisplay = (date: string | null) => {
        if (!date) return 'Select date';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className={`relative ${className}`}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-start text-left font-normal"
            >
                <Calendar className="mr-2 h-4 w-4" />
                {range.start && range.end ? (
                    `${formatDateDisplay(range.start)} - ${formatDateDisplay(range.end)}`
                ) : (
                    'Select date range'
                )}
                {(range.start || range.end) && (
                    <X
                        className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                    />
                )}
            </Button>

            {isOpen && (
                <Card className="absolute z-50 mt-2 w-auto min-w-[300px]">
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            {/* Presets */}
                            {presets && (
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">
                                        Quick Select
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {presetRanges.map((preset) => (
                                            <Button
                                                key={preset.label}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePresetClick(preset.days)}
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Range */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    Custom Range
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="start-date" className="text-xs">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={range.start || ''}
                                            onChange={(e) => handleStartDateChange(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="end-date" className="text-xs">
                                            End Date
                                        </Label>
                                        <Input
                                            id="end-date"
                                            type="date"
                                            value={range.end || ''}
                                            onChange={(e) => handleEndDateChange(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                                    Close
                                </Button>
                                <Button size="sm" onClick={() => setIsOpen(false)}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export function useDateRange(initialStart?: string, initialEnd?: string) {
    const [dateRange, setDateRange] = useState<DateRange>({
        start: initialStart || null,
        end: initialEnd || null,
    });

    const setRange = (range: DateRange) => {
        setDateRange(range);
    };

    const clearRange = () => {
        setDateRange({ start: null, end: null });
    };

    return {
        dateRange,
        setRange,
        clearRange,
    };
}