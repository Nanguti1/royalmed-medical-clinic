import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Preauthorization } from '@/types/insurance';

type PageProps = {
    preauth: Preauthorization;
};

export default function PreauthorizationApprove() {
    const { preauth } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        action: '',
        authorized_amount: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/insurance/preauthorizations/${preauth.id}/approve`, {
            onSuccess: () => {
                window.location.href = '/insurance/preauthorizations';
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'expired':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Process Preauthorization" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/insurance/preauthorizations">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Process Preauthorization</h1>
                        <p className="text-muted-foreground">
                            {preauth.patient?.first_name} {preauth.patient?.last_name}
                        </p>
                    </div>
                    <Badge className={getStatusColor(preauth.status)}>
                        {preauth.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Preauthorization Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Patient:</span> {preauth.patient?.first_name} {preauth.patient?.last_name} ({preauth.patient?.hospital_number})</p>
                            <p><span className="font-medium">Service Type:</span> {preauth.service_type}</p>
                            <p><span className="font-medium">Service Description:</span> {preauth.service_description}</p>
                            <p><span className="font-medium">Estimated Cost:</span> ${preauth.estimated_cost.toLocaleString()}</p>
                            {preauth.insurer && (
                                <p><span className="font-medium">Insurer:</span> {preauth.insurer.name}</p>
                            )}
                            {preauth.scheme && (
                                <p><span className="font-medium">Scheme:</span> {preauth.scheme.name}</p>
                            )}
                            <p><span className="font-medium">Request Date:</span> {new Date(preauth.request_date).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Process Decision</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="action">Action *</Label>
                                    <Select
                                        value={data.action}
                                        onValueChange={(value) => setData('action', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="approve">Approve</SelectItem>
                                            <SelectItem value="reject">Reject</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.action && <p className="text-sm text-red-500">{errors.action}</p>}
                                </div>

                                {data.action === 'approve' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="authorized_amount">Authorized Amount *</Label>
                                        <Input
                                            id="authorized_amount"
                                            type="number"
                                            step="0.01"
                                            value={data.authorized_amount}
                                            onChange={(e) => setData('authorized_amount', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        {errors.authorized_amount && <p className="text-sm text-red-500">{errors.authorized_amount}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes or reason for rejection"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/insurance/preauthorizations">Cancel</a>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !data.action}
                                    variant={data.action === 'approve' ? 'default' : 'destructive'}
                                >
                                    {data.action === 'approve' ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {processing ? 'Approving...' : 'Approve'}
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            {processing ? 'Rejecting...' : 'Reject'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
