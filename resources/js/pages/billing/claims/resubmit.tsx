import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageProps = {
    claim: {
        id: number;
        claim_number: string;
        amount_claimed: number;
        rejection_reason: string | null;
        notes: string | null;
    };
};

export default function ClaimResubmit() {
    const { claim } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        corrected_data: {
            amount_claimed: claim.amount_claimed,
            notes: claim.notes || '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/insurance/claims/${claim.id}/resubmit`, {
            onSuccess: () => {
                window.location.href = `/insurance/claims/${claim.id}`;
            },
        });
    };

    return (
        <>
            <Head title="Resubmit Insurance Claim" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/insurance/claims/${claim.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Resubmit Insurance Claim</h1>
                        <p className="text-muted-foreground">{claim.claim_number}</p>
                    </div>
                </div>

                {claim.rejection_reason && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Previous Rejection Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{claim.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Corrected Claim Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount_claimed">Amount Claimed *</Label>
                                    <Input
                                        id="amount_claimed"
                                        type="number"
                                        step="0.01"
                                        value={data.corrected_data.amount_claimed}
                                        onChange={(e) => setData('corrected_data', { ...data.corrected_data, amount_claimed: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                    />
                                    {errors['corrected_data.amount_claimed'] && <p className="text-sm text-red-500">{errors['corrected_data.amount_claimed']}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.corrected_data.notes}
                                    onChange={(e) => setData('corrected_data', { ...data.corrected_data, notes: e.target.value })}
                                    placeholder="Additional notes or corrections"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/insurance/claims/${claim.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {processing ? 'Resubmitting...' : 'Resubmit Claim'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
