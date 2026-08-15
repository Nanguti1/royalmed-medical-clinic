import { Head, usePage } from '@inertiajs/react';
import { Shield, Calendar, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { ControlledDrugRegister } from '@/types/pharmacy';

type PageProps = {
    drugs: ControlledDrugRegister[];
};

export default function ControlledDrugRegister() {
    const { drugs } = usePage<PageProps>().props;

    const getScheduleColor = (schedule: string) => {
        switch (schedule) {
            case 'I':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'II':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'III':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'IV':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'V':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Controlled Drug Register" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Controlled Drug Register</h1>
                        <p className="text-muted-foreground">Track controlled substances with audit trail.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search drugs..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                {drugs.length === 0 ? (
                    <EmptyState
                        icon={Shield}
                        title="No controlled drugs found"
                        description="The controlled drug register is empty."
                    />
                ) : (
                    <div className="grid gap-4">
                        {drugs.map((drug) => (
                            <Card key={drug.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{drug.drug_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{drug.generic_name}</p>
                                        </div>
                                        <Badge className={getScheduleColor(drug.schedule)}>
                                            Schedule {drug.schedule}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Batch Number:</span>
                                                <span className="font-medium">{drug.batch_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span className="font-medium">{drug.quantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Balance:</span>
                                                <span className="font-medium">{drug.balance}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Received:</span>
                                                <span className="font-medium">{new Date(drug.received_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Expiry:</span>
                                                <span className="font-medium">{new Date(drug.expiry_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Supplier:</span>
                                                <span className="font-medium">{drug.supplier}</span>
                                            </div>
                                            {drug.issued_to && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Issued To:</span>
                                                    <span className="font-medium">{drug.issued_to}</span>
                                                </div>
                                            )}
                                            {drug.issued_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Issued Date:</span>
                                                    <span className="font-medium">{new Date(drug.issued_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {drug.purpose && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Purpose:</span>
                                                    <span className="font-medium">{drug.purpose}</span>
                                                </div>
                                            )}
                                            {drug.notes && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Notes:</span>
                                                    <span className="font-medium">{drug.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
