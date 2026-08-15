import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onFilter: (startDate: string, endDate: string) => void;
}

export function DateRangePicker({ startDate, endDate, onFilter }: DateRangePickerProps) {
    const { data, setData, get, processing } = useForm({
        start_date: startDate,
        end_date: endDate,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(data.start_date, data.end_date);
    };

    return (
        <form onSubmit={handleFilter} className="flex gap-2 items-end">
            <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                />
            </div>
            <Button type="submit" disabled={processing}>
                <Calendar className="mr-2 h-4 w-4" />
                Apply
            </Button>
        </form>
    );
}
