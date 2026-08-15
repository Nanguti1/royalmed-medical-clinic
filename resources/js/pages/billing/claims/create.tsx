import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    invoice: {
        id: number;
        invoice_number: string;
        total_amount: number;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            hospital_number: string;
        };
        patientCoverage: Array<{
            id: number;
            insurer_id: number;
            insurer: {
                id: number;
                name: string;
            };
            scheme: {
                id: number;
                name: string;
            };
        }>;
        items: Array<{
            id: number;
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
        }>;
    };
};

export default function ClaimCreate() {
    const { invoice } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        insurer_id: '',
        insurance_scheme_id: '',
        service_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/insurance/claims/create/${invoice.id}`, {
            onSuccess: () => {
                window.location.href = '/insurance/claims';
            },
        });
    };

    return (
        <>
            <Head title="Create Insurance Claim" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={`/billing/invoices/${invoice.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Insurance Claim</h1>
                        <p className="text-muted-foreground">Submit claim for invoice {invoice.invoice_number}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Patient:</span> {invoice.patient.first_name} {invoice.patient.last_name} ({invoice.patient.hospital_number})</p>
                            <p><span className="font-medium">Invoice:</span> {invoice.invoice_number}</p>
                            <p><span className="font-medium">Total Amount:</span> ${invoice.total_amount.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Claim Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="insurer_id">Insurer *</Label>
                                    <Select
                                        value={data.insurer_id}
                                        onValueChange={(value) => setData('insurer_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select insurer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {invoice.patientCoverage.map((coverage) => (
                                                <SelectItem key={coverage.id} value={coverage.insurer_id.toString()}>
                                                    {coverage.insurer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.insurer_id && <p className="text-sm text-red-500">{errors.insurer_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="insurance_scheme_id">Insurance Scheme *</Label>
                                    <Select
                                        value={data.insurance_scheme_id}
                                        onValueChange={(value) => setData('insurance_scheme_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scheme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {invoice.patientCoverage.map((coverage) => (
                                                <SelectItem key={coverage.id} value={coverage.scheme.id.toString()}>
                                                    {coverage.scheme.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.insurance_scheme_id && <p className="text-sm text-red-500">{errors.insurance_scheme_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_date">Service Date *</Label>
                                    <Input
                                        id="service_date"
                                        type="date"
                                        value={data.service_date}
                                        onChange={(e) => setData('service_date', e.target.value)}
                                    />
                                    {errors.service_date && <p className="text-sm text-red-500">{errors.service_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={`/billing/invoices/${invoice.id}`}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Claim'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
