import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: Props) {
    return (
        <Card className={cn('flex flex-col items-center justify-center p-8', className)}>
            <CardHeader className="text-center">
                {Icon && (
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                )}
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            {action && (
                <CardContent>
                    <Button onClick={action.onClick}>{action.label}</Button>
                </CardContent>
            )}
        </Card>
    );
}
