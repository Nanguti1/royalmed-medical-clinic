import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Props = {
    count?: number;
    className?: string;
};

export function LoadingState({ count = 1, className }: Props) {
    return (
        <div className={cn('space-y-4', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="mb-2 h-8 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function LoadingCard({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="mb-2 h-8 w-1/4" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
    );
}

export function LoadingSummaryCard({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}
