import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
    title?: string;
    message?: string;
};

export function AuthorizationCard({ title = 'Access Denied', message = 'You do not have permission to access this resource.' }: Props) {
    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact your administrator.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
