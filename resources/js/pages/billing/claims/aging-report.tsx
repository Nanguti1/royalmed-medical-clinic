import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClaimAgingReport } from '@/types/insurance';

type PageProps = {
    report: ClaimAgingReport;
};

export default function ClaimAgingReport() {
    const { report } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Claim Aging Report" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/claims">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Claim Aging Report</h1>
                        <p className="text-muted-foreground">Outstanding claims by age</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">0-30 Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{report.claims_0_30}</div>
                            <p className="text-sm text-muted-foreground">
                                <DollarSign className="inline h-3 w-3" />
                                ${report.total_value_0_30.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{report.claims_31_60}</div>
                            <p className="text-sm text-muted-foreground">
                                <DollarSign className="inline h-3 w-3" />
                                ${report.total_value_31_60.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{report.claims_61_90}</div>
                            <p className="text-sm text-muted-foreground">
                                <DollarSign className="inline h-3 w-3" />
                                ${report.total_value_61_90.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">90+ Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{report.claims_90_plus}</div>
                            <p className="text-sm text-muted-foreground">
                                <DollarSign className="inline h-3 w-3" />
                                ${report.total_value_90_plus.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>By Insurer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {report.by_insurer.map((insurer) => (
                                <div key={insurer.insurer_id} className="flex items-center justify-between p-4 border rounded">
                                    <div>
                                        <p className="font-medium">{insurer.insurer_name}</p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span>0-30: {insurer.claims_0_30}</span>
                                            <span>31-60: {insurer.claims_31_60}</span>
                                            <span>61-90: {insurer.claims_61_90}</span>
                                            <span className="text-red-600">90+: {insurer.claims_90_plus}</span>
                                        </div>
                                    </div>
                                    {insurer.claims_90_plus > 0 && (
                                        <Badge variant="destructive">
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                            Attention Needed
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
