import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function ConsentTemplateCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        content: '',
        category: 'general',
        requires_witness: false,
        requires_signature: true,
        expiry_days: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/documents/consent-templates', {
            onSuccess: () => {
                window.location.href = '/documents/consent-templates';
            },
        });
    };

    return (
        <>
            <Head title="New Consent Template" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/documents/consent-templates">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Consent Template</h1>
                        <p className="text-muted-foreground">Create a new consent form template.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Template Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Surgery Consent"
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
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="surgery">Surgery</SelectItem>
                                            <SelectItem value="procedures">Procedures</SelectItem>
                                            <SelectItem value="treatment">Treatment</SelectItem>
                                            <SelectItem value="research">Research</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry_days">Expiry Days</Label>
                                    <Input
                                        id="expiry_days"
                                        type="number"
                                        value={data.expiry_days}
                                        onChange={(e) => setData('expiry_days', e.target.value)}
                                        placeholder="e.g., 30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the template"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content *</Label>
                                <Input
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Template content with placeholders"
                                />
                                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="requires_witness"
                                        checked={data.requires_witness}
                                        onCheckedChange={(checked) => setData('requires_witness', checked as boolean)}
                                    />
                                    <Label htmlFor="requires_witness" className="cursor-pointer">Requires Witness</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="requires_signature"
                                        checked={data.requires_signature}
                                        onCheckedChange={(checked) => setData('requires_signature', checked as boolean)}
                                    />
                                    <Label htmlFor="requires_signature" className="cursor-pointer">Requires Signature</Label>
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
                                    <a href="/documents/consent-templates">Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Template'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
