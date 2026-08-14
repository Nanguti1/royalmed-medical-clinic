import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/loading-state';

type EnhancedLoadingStateProps = {
    count?: number;
    type?: 'card' | 'list' | 'table' | 'form';
};

export function EnhancedLoadingState({ count = 3, type = 'card' }: EnhancedLoadingStateProps) {
    if (type === 'card') {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
                {Array.from({ length: count - 1 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'form') {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <LoadingState count={count} />;
}

type EnhancedEmptyStateProps = {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
};

export function EnhancedEmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
}: EnhancedEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {Icon && (
                <div className="mb-4 p-4 bg-muted rounded-full">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">{description}</p>
            <div className="flex gap-3">
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        {action.label}
                    </button>
                )}
                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                        {secondaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
}

type ErrorStateProps = {
    title?: string;
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
};

export function ErrorState({ title = 'Something went wrong', message, onRetry, onDismiss }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="mb-4 p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">{message}</p>
            <div className="flex gap-3">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}