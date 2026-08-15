import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PageProps = {
    patients: Array<{
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    }>;
};

export default function DepositCreate() {
    const { patients } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        amount: '',
        deposit_date: new Date().toISOString().split('T')[0],
        method: 'cash',
        reference_number: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/billing/deposits', {
            onSuccess: () => {
                window.location.href = '/billing/deposits';
            },
        });
    };

    return (
        <>
            <Head title="Create Deposit" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/billing/deposits">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Deposit</h1>
                        <p className="text-muted-foreground">Record a patient deposit or prepayment.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Deposit Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <Select
                                        value={data.patient_id}
                                        onValueChange={(value) => setData('patient_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                                    {patient.hospital_number} - {patient.first_name} {patient.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                    />
                                    {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deposit_date">Deposit Date *</Label>
                                    <Input
                                        id="deposit_date"
                                        type="date"
                                        value={data.deposit_date}
                                        onChange={(e) => setData('deposit_date', e.target.value)}
                                    />
                                    {errors.deposit_date && <p className="text-sm text-red-500">{errors.deposit_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="method">Payment Method *</Label>
                                    <Select
                                        value={data.method}
                                        onValueChange={(value) => setData('method', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.method && <p className="text-sm text-red-500">{errors.method}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                    />
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
                                    <a href="/billing/deposits">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Deposit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
