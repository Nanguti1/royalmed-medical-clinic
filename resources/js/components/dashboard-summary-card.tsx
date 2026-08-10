import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    className?: string;
};

export function DashboardSummaryCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendDirection = 'neutral',
    className,
}: Props) {
    return (
        <Card className={cn('relative overflow-hidden', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                {trend && (
                    <div className="mt-2 flex items-center text-xs">
                        {trendDirection === 'up' && (
                            <ArrowUp className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                        )}
                        {trendDirection === 'down' && (
                            <ArrowDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span
                            className={cn(
                                'font-medium',
                                trendDirection === 'up' && 'text-green-600 dark:text-green-400',
                                trendDirection === 'down' && 'text-red-600 dark:text-red-400',
                                trendDirection === 'neutral' && 'text-muted-foreground',
                            )}
                        >
                            {trend}
                        </span>
                        <span className="ml-1 text-muted-foreground">from last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
