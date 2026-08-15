import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function ProcedureCreate() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
        category: 'restorative',
        base_cost: '',
        duration_minutes: '',
        anesthesia_required: false,
        notes: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dental/procedures', {
            onSuccess: () => {
                window.location.href = '/dental/procedures';
            },
        });
    };

    return (
        <>
            <Head title="New Dental Procedure" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/dental/procedures">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Dental Procedure</h1>
                        <p className="text-muted-foreground">Add a new procedure to the catalogue.</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Procedure Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g., D0120"
                                    />
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Periodic Oral Evaluation"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                            <SelectItem value="preventive">Preventive</SelectItem>
                                            <SelectItem value="restorative">Restorative</SelectItem>
                                            <SelectItem value="prosthetic">Prosthetic</SelectItem>
                                            <SelectItem value="surgical">Surgical</SelectItem>
                                            <SelectItem value="orthodontic">Orthodontic</SelectItem>
                                            <SelectItem value="endodontic">Endodontic</SelectItem>
                                            <SelectItem value="periodontic">Periodontic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="base_cost">Base Cost *</Label>
                                    <Input
                                        id="base_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.base_cost}
                                        onChange={(e) => setData('base_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.base_cost && <p className="text-sm text-red-500">{errors.base_cost}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                                    <Input
                                        id="duration_minutes"
                                        type="number"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the procedure"
                                />
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

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="anesthesia_required"
                                        checked={data.anesthesia_required}
                                        onCheckedChange={(checked) => setData('anesthesia_required', checked as boolean)}
                                    />
                                    <Label htmlFor="anesthesia_required" className="cursor-pointer">Anesthesia Required</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href="/dental/procedures">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Procedure'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
